import { NextAuthConfig } from "next-auth";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
import CustomProvider from "@/lib/CustomProvider";
import { Redis } from "@upstash/redis"
import { refreshAccessToken } from "@/utils/auth";

const redis = (process.env.NODE_ENV === 'production') ? new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
}) : undefined;

export const authConfig: NextAuthConfig = {
  // https://authjs.dev/getting-started/adapters/upstash-redis?framework=next-js#configuration
  adapter: redis ? UpstashRedisAdapter(redis) : undefined,
  providers: [
    CustomProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // 初回サインイン時
      if (account && user) {
        const customAccount = account as unknown as {
          access_token: string;
          refresh_token?: string;
          expires_at?: number;
        };

        console.log('customAccount', customAccount);

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

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.error = token.error as string;

      return session;
    },
  },
  // ... 他の設定
} satisfies NextAuthConfig;