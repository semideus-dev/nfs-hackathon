import React from "react";
import Link from "next/link";

import AuthCard from "@/modules/auth/ui/components/auth-card";
import SignUpForm from "@/modules/auth/ui/components/sign-up-form";

export default function SignUpView() {
  return (
    <>
      <AuthCard title="Create an Account">
        <SignUpForm />
      </AuthCard>
      <span className="text-muted-foreground my-5 text-sm">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary underline underline-offset-2 transition-all duration-300 hover:underline-offset-4"
        >
          Sign In
        </Link>
      </span>
    </>
  );
}
