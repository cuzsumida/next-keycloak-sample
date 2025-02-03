import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * `useSession`、`getSession`、`Provider` によって返されるセッションオブジェクト
   */
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      /** The user's postal address. */
      id: string;
    } & DefaultSession["user"];
  }
}