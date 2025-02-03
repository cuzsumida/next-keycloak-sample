import { authConfig } from "@/config/authConfig";
import NextAuth from "next-auth";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

// sample...
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [Keycloak],
//   callbacks: {
//     async jwt({ token, account }) {
//       if (account) {
//         token.accessToken = account.access_token;
//         token.refreshToken = account.refresh_token;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       session.refreshToken = token.refreshToken;
//       return session;
//     },
//   },
// });