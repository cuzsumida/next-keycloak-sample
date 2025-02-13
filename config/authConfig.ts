import { NextAuthConfig } from "next-auth";
import CustomProvider from "@/lib/CustomProvider";
import {redis, storage} from "@/lib/redis";
import { refreshAccessToken } from "@/utils/auth";
import { UnstorageAdapter } from "@auth/unstorage-adapter";
import { ParsedUserInfo } from "@/types/ParsedUserInfo";


export const authConfig: NextAuthConfig = {
  // https://authjs.dev/getting-started/adapters/upstash-redis?framework=next-js#configuration
  adapter: UnstorageAdapter(storage, { baseKeyPrefix: "auth:" }),
  providers: [
    CustomProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],
  // session: {
  //   strategy: 'jwt', // jwt ストラテジーを使用
  // },

  callbacks: {
    async signIn(user, account, profile) {
      console.log('SignInUserId', user.user.id);
      console.log('SignInUserId', user)
      console.log('SignInAccount', account);
      console.log('SignInProfile', profile);

      console.log('Redisに保存条件分岐前')
      if (user) {
        console.log(`user:userInfo:${user.user.id}`, 'Redisに保存します');
        // Redis に id_token を保存
        await redis.set(`user:userInfo:${user.user.id}`, JSON.stringify(user));
        console.log(`user:userInfo:${user.user.id}`, 'Redis出来ました。');
      }

      return true;
    },

    async jwt({ token, account, user }) {
      // 初回サインイン時
      if (account && user) {
        const customAccount = account as unknown as {
          access_token: string;
          refresh_token?: string;
          expires_at?: number;
        };

        console.log('customAccount', customAccount);
        console.log('user', user); 

        return {
          accessToken: customAccount.access_token,
          refreshToken: customAccount.refresh_token,
          accessTokenExpires:
            customAccount.expires_at
              ? customAccount.expires_at * 1000
              : undefined, // 有効期限をミリ秒単位に変換
          user,
        };
      }
      // それ以外の場合、トークンがまだ有効かどうかを確認し、無効であればリフレッシュを試みる
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // リフレッシュトークンを使って新しいアクセストークンを取得
      const refreshedToken = await refreshAccessToken(token.refreshToken as string);

      return {
        ...token,
        accessToken: refreshedToken.access_token,
        accessTokenExpires: refreshedToken.expires_in ? Date.now() + refreshedToken.expires_in * 1000 : token.accessTokenExpires,
        refreshToken: refreshedToken.refresh_token ?? token.refreshToken, // 新しいリフレッシュトークンが提供されない場合は、既存のものを保持
      };
    },

    async session({ session, user }) {
      // console.log('SessionUserId', session.user.id);
      // console.log('testsession', session);
      // // console.log('testtoken', token);
      // console.log('testuser', user);

      const userInfo = await redis.get(`user:userInfo:${user.id}`);
      // console.log('RedisUserInfo', userInfo);
      if (userInfo) {
        // JSON文字列をオブジェクトに変換
        const parsedUserInfo: ParsedUserInfo = JSON.parse(userInfo);
        console.log('ParsedRedisUserInfo', parsedUserInfo);

        /*
          ここで、ID_tokenのデコードを行いBEへJSON形式でid_tokenのpayloadを渡します
          基本的には、BFF側でデータを保存しなくても良い想定なのでRedisに保存している情報を削除しています
          今後BFFでも必要になる可能性があるならば残しておく
        */
        // await redis.del(`user:userInfo:${user.user.id}`);

        session.accessToken = parsedUserInfo.account.access_token;
        session.refreshToken = parsedUserInfo.account.refresh_token;
        session.user.id = user.id
      }

      console.log('testsession', session);

      return session;
    },
  },
  // ... 他の設定
} satisfies NextAuthConfig;