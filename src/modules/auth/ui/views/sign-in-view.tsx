import React from "react";
import Link from "next/link";

import AuthCard from "@/modules/auth/ui/components/auth-card";
import SignInForm from "@/modules/auth/ui/components/sign-in-form";

export default function SignInView() {
  return (
    <>
      <AuthCard title="Sign into Spark">
        <SignInForm />
      </AuthCard>
      <span className="text-muted-foreground my-5 text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-primary underline underline-offset-2 transition-all duration-300 hover:underline-offset-4"
        >
          Sign Up
        </Link>
      </span>
    </>
  );
}
