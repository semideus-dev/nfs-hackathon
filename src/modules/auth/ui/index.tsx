import React from "react";
import Link from "next/link";

import AuthCard from "@/modules/auth/ui/components/auth-card";
import SignInForm from "@/modules/auth/ui/components/sign-in-form";
import SignUpForm from "@/modules/auth/ui/components/sign-up-form";

export function SignInView() {
  return (
    <>
      <AuthCard title="Sign into Mimir">
        <SignInForm />
      </AuthCard>
      <span className="text-sm text-muted-foreground my-5">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-primary underline underline-offset-2 hover:underline-offset-4 transition-all duration-300"
        >
          Sign Up
        </Link>
      </span>
    </>
  );
}

export function SignUpView() {
  return (
    <>
      <AuthCard title="Create an Account">
        <SignUpForm />
      </AuthCard>
      <span className="text-sm text-muted-foreground my-5">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary underline underline-offset-2 hover:underline-offset-4 transition-all duration-300"
        >
          Sign In
        </Link>
      </span>
    </>
  );
}
