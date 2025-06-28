"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/lib/auth-client";

import SocialAuth from "@/modules/auth/ui/components/social-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  EyeIcon,
  EyeOffIcon,
  GithubIcon,
  GoogleIcon,
  LoadingIcon,
} from "@/components/icons";
import { toast } from "sonner";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username is too short.")
    .max(30, "Username is too long."),
  email: z.string().min(1, "Email is required.").email("Invalid email."),
  password: z.string().min(8, "Password must be 8 characters long."),
});

export default function SignUpForm() {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const [pending, setPending] = React.useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setPending(true);
    authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.username,
      },
      {
        onError: ({ error }) => {
          setPending(false);
          toast.error(error.message || "An error occurred. Please try again.");
        },
        onSuccess: () => {
          setPending(false);
          router.push("/");
          toast.success("Signed up successfully!");
        },
      }
    );
  }

  function toggleVisibility() {
    setIsVisible((prevState) => !prevState);
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Mimir" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="mail@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    className="pe-9"
                    placeholder="********"
                    type={isVisible ? "text" : "password"}
                    {...field}
                  />
                  <button
                    className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    onClick={toggleVisibility}
                    aria-label={isVisible ? "Hide password" : "Show password"}
                    aria-pressed={isVisible}
                  >
                    {isVisible ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={pending}
          className="w-full font-semibold uppercase bg-gradient-to-r from-red-400 to-yellow-400 tracking-wide rounded-full"
        >
          {pending ? <LoadingIcon className="animate-spin" /> : "sign up"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            OR
          </span>
        </div>
        <SocialAuth />
      </form>
    </Form>
  );
}
