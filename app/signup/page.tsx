import { redirect } from "next/navigation";
import AuthForm from "../AuthForm";
import { signup } from "../actions";
import { getCurrentUser } from "@/lib/auth";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <AuthForm
      action={signup}
      title="Create your account"
      submitLabel="Sign up"
      altText="Already have an account?"
      altHref="/login"
      altLabel="Log in"
    />
  );
}
