import { signIn } from "@/auth"


export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        // lib\CustomProvider.ts
        await signIn("custom", { callbackUrl: "http://localhost:3000" })
      }}
    >
      <button type="submit">Signin with Custom Provider</button>
    </form>
  )
} 