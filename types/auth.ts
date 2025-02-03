export interface TokenResponse {
  access_token: string;
  refresh_token?: string; // リフレッシュトークンが存在しない場合もあるので、オプショナルにする
  expires_in?: number;    // アクセストークンの有効期限（秒単位）
  token_type?: string;   // トークンの種類（例：Bearer）
  scope?: string;        // トークンに付与されたスコープ
  // ... 他に認証基盤から返される情報があれば、ここに追加
}