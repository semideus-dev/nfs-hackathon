import React from "react";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { GithubIcon, GoogleIcon } from "@/components/icons";

export default function SocialAuth() {
  function onSubmit(provider: "google" | "github") {
    authClient.signIn.social({
      provider: provider,
      callbackURL: "/dashboard",
    });
  }
  return (
    <div className="grid md:grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => onSubmit("google")}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onSubmit("github")}
      >
        <GithubIcon />
        Continue with Github
      </Button>
    </div>
  );
}
