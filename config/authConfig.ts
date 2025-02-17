import { NextAuthConfig } from "next-auth";
import CustomProvider from "@/lib/CustomProvider";
import {redis, storage} from "@/lib/redis";
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
  session: {
    // strategy: 'jwt', // jwt ストラテジーを使用セッションクッキーの名前
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "custom-session-token", // 変更したいCookie名
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      },
    },
  },

  callbacks: {
    async signIn(user) {
      /*
        サインインが成功したときに呼び出されます。
        このコールバックを使用して、サインインが成功したときにカスタムの処理を実行でき
      */
      console.log('signIn', user);
      if (user) {
        // Redis に id_token を保存
        await redis.set(`user:userInfo:${user.user.id}`, JSON.stringify(user));

        return true;
      }

      return false;

    },

    // async redirect() {
    //   /*
    //     サインイン、サインアウト、または認証エラーが発生した後にリダイレクト先の URL をカスタマイズするために使用されます。
    //     以下サンプルコード
    //   */
    //   const response = await fetch(`${baseUrl}/api/resourceServer`, {
    //     method: 'GET',
    //     headers: {
    //       'Authorization': `Bearer ${token.accessToken}`,          },
    //   });
    //   const data = await response.json();
    //   // リソースサーバーから null が返ってきた場合、register 画面にリダイレクト
    //   if (data === null) {
    //     return `${baseUrl}/register`;
    //   }
    //   // デフォルトのリダイレクト先
    //   return url.startsWith(baseUrl) ? url : baseUrl;
    // },

    async jwt({ token }) {
      /*
        JWT トークンが作成されるときに呼び出されます。
        このコールバックを使用して、トークンにカスタムデータを追加したり、
        トークンの内容をカスタマイズしたりできます。
        
        本実装では、sessionを利用しているため、このコールバックは呼ばれません。
      */
      return token;
    },

    async session({ session, user }) {
      /*
        セッションが作成または更新されるときに呼び出されます。
        このコールバックを使用して、セッションオブジェクトにカスタムデータを追加したり、
        セッションの内容をカスタマイズしたりできます。
      */

      const userInfo = await redis.get(`user:userInfo:${user.id}`);
      if (userInfo) {
        // JSON文字列をオブジェクトに変換
        const parsedUserInfo: ParsedUserInfo = JSON.parse(userInfo);
        console.log('ParsedRedisUserInfo', parsedUserInfo);

        session.accessToken = parsedUserInfo.account.access_token;
        session.refreshToken = parsedUserInfo.account.refresh_token;
        session.user.id = user.id
      }
      // session.hoge = 'hoge3'
      // console.log(session, 'session')

      return session;
    },
  },
  // ... 他の設定
} satisfies NextAuthConfig;