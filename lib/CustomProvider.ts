import { fetchTokens } from "@/utils/auth";
import { OAuthConfig, OAuthUserConfig, TokenEndpointHandler, UserinfoEndpointHandler } from "next-auth/providers";

interface CustomProfile extends Record<string, string> {
  // ユーザー情報（認証基盤から取得するもの）の型定義
  id: string;
  name: string;
  email: string;
  // ...
}

export default function CustomProvider(
  options: OAuthUserConfig<CustomProfile>,
): OAuthConfig<CustomProfile> {
  return {
    id: "custom", // プロバイダーのID, 任意の文字列
    name: "Custom Provider",
    type: "oidc",
    issuer: process.env.AUTH_KEYCLOAK_ISSUER,
    idToken: true,
    wellKnown: process.env.WELL_KNOWN_ENDPOINT,
    authorization: {
      url: process.env.AUTHORIZATION_ENDPOINT,
      params: {
        scope: "openid profile email",
      },
    },
    token: {
      async request(context: TokenEndpointHandler) {
        let tokens;
        try {
          tokens = await fetchTokens(context.params.code);
          console.log('test', tokens)
        } catch (error) {
          console.error(error);
          throw new Error("Failed to fetch tokens");
        }
        return { tokens };
      },
    },
    userinfo: {
      async request(context: UserinfoEndpointHandler) {
        const userInfoEndpoint = process.env.USERINFO_ENDPOINT!;
        const response = await fetch(userInfoEndpoint, {
          headers: {
            Authorization: `Bearer ${context.tokens.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const profile: CustomProfile = await response.json();
        return profile;
      },
    },
    options,
  };
}
