## setup auth.js
https://authjs.dev/getting-started/installation?framework=next-js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# keycloak env example
```
AUTH_KEYCLOAK_ID=keycloak-sample
AUTH_KEYCLOAK_SECRET=BZ36JxGm0SCuTV6MkY0a7c5tF0wH3FNC
AUTH_KEYCLOAK_ISSUER=http://localhost:8080/realms/master
AUTH_SECRET="UlCVQzoUlisG79HhVl3F7viy7tFra9en+fgp1z+5PDI=" # Added by `npx auth`. Read more: https://cli.authjs.dev
NEXTAUTH_URL=http://localhost:3000

AUTHORIZATION_ENDPOINT=http://localhost:8080/realms/master/protocol/openid-connect/auth
TOKEN_ENDPOINT=http://localhost:8080/oauth/token
USERINFO_ENDPOINT=http://localhost:8080/userinfo
WELL_KNOWN_ENDPOINT=http://localhost:8080/.well-known/openid-configuration
CLIENT_ID=keycloak-sample
CLIENT_SECRET=BZ36JxGm0SCuTV6MkY0a7c5tF0wH3FNC

UPSTASH_REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_TOKEN=

```