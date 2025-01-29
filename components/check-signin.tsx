'use client'
import { useSession } from 'next-auth/react';

export default function CheckSignIn() {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <div>
          <p>ログイン済み: {session?.user?.name}</p>
          <p>accessToken: { session.accessToken}</p>
          <p>refreshToken: { session.refreshToken}</p>
        </div>
      ) : (
        <div>no authorization</div>
      )}
    </div>
  );
}