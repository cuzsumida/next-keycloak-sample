interface ParsedUserInfo {
  user: {
    id: string;
    name: string;
    emailVerified: null | boolean;
  };
  account: {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    id_token: string;
    'not-before-policy': number;
    session_state: string;
    scope: string;
    expires_at: number;
    provider: string;
    type: string;
    providerAccountId: string;
  };
  profile: {
    exp: number;
    iat: number;
    auth_time: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    session_state: string;
    at_hash: string;
    acr: string;
    sid: string;
    email_verified: boolean;
    preferred_username: string;
  };
}

export type { ParsedUserInfo };