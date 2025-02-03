import { TokenResponse } from "@/types/auth";

// Access Token を取得する関数
async function fetchTokens(
  authorizationCode: string,
): Promise<TokenResponse> {
  const tokenEndpoint = process.env.TOKEN_ENDPOINT!;
  const clientId = process.env.CLIENT_ID!;
  const clientSecret = process.env.CLIENT_SECRET!;
  const redirectUri = process.env.REDIRECT_URI!;

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: authorizationCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tokens");
  }

  const data: TokenResponse = await response.json();
  return data;
}

// Refresh Token を使って Access Token を更新する関数
async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const refreshTokenUrl = process.env.REFRESH_TOKEN_URL!;
  const clientId = process.env.CLIENT_ID!;
  const clientSecret = process.env.CLIENT_SECRET!;

  const response = await fetch(refreshTokenUrl, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const refreshedTokens = await response.json();

  if (!response.ok) {
    throw refreshedTokens;
  }

  return refreshedTokens
}

export { fetchTokens, refreshAccessToken };