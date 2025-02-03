import { auth } from "./api/auth/[...nextauth]/route";
export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};