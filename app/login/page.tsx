import { redirect } from "next/navigation";
import AuthForm from "../AuthForm";
import { login } from "../actions";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <AuthForm
      action={login}
      title="Log in"
      submitLabel="Log in"
      altText="Don't have an account?"
      altHref="/signup"
      altLabel="Sign up"
    />
  );
}
