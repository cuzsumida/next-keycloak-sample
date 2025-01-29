// https://authjs.dev/getting-started/session-management/get-session
// http://localhost:3000/api/auth/sso-logout
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth()
  console.log(session);

  if (session) {
    const refreshToken = session.refreshToken; // リフレッシュトークンを取得

    const response = await fetch(
      'http://localhost:8080/realms/master/protocol/openid-connect/logout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: process.env.AUTH_KEYCLOAK_ID as string,
          client_secret: process.env.AUTH_KEYCLOAK_SECRET as string,
        }),
      }
    );

    if (response.ok) {
      // NextAuth.js の signOut() でクライアント側のセッションを終了
      await signOut();
    } else {
    }

    return new Response('API response with refresh token ');
  }

  return new Response('Unauthorized', { status: 401 });
}

