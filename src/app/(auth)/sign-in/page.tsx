import React from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import SignInView from "@/modules/auth/ui/views/sign-in-view";

export const metadata: Metadata = {
  title: "Spark - Sign In",
  description: "Sign into you account to use mimir",
};

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) {
    redirect("/");
  }
  return <SignInView />;
}
