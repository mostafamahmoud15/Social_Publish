"use client";

import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  Plug,
  Users,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useMe from "@/hooks/useMe";
import { Role } from "@/constant/constant";

/**
 * Dashboard home page
 */
export default function Home() {
  const { data, isLoading } = useMe();
  const user = data?.data?.user;

  /**
   * Fallback name if user data is not loaded
   */
  const name = user?.username || "Guest";

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* Hero section */}
      <section className="relative overflow-hidden rounded-3xl border bg-linear-to-br from-black to-gray-800 px-6 py-10 text-white md:px-10 md:py-14">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">

          {/* Small label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Benaa Social Publisher Dashboard
          </div>

          {/* Welcome message */}
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            {isLoading
              ? "Welcome 👋"
              : `Welcome back, ${name} 👋`}
          </h1>

          {/* Short intro text */}
          <p className="max-w-2xl text-sm text-white/80 md:text-base">
            Manage your content, connect platforms, and publish your posts
            easily from one place.
          </p>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/dashboard/posts">
              <Button className="rounded-xl bg-white text-black hover:bg-white/90">
                Go to Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/connect">
              <Button
                variant="outline"
                className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/70"
              >
                Connect Accounts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick navigation cards */}
      <section className="grid gap-4 md:grid-cols-3">

        {/* Posts card */}
        <Link href="/dashboard/posts">
          <Card className="group rounded-2xl border transition hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="space-y-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                <LayoutGrid className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <h2 className="font-semibold">Posts</h2>
                <p className="text-sm text-muted-foreground">
                  Create and manage your posts.
                </p>
              </div>

              <div className="flex items-center text-sm font-medium">
                Open section
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Connect accounts card */}
        <Link href="/dashboard/connect">
          <Card className="group rounded-2xl border transition hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="space-y-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                <Plug className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <h2 className="font-semibold">Connect Accounts</h2>
                <p className="text-sm text-muted-foreground">
                  Link your social media platforms.
                </p>
              </div>

              <div className="flex items-center text-sm font-medium">
                Open section
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>



        {/* Users card */}

        {user?.role === Role.OWNER && <Link href="/dashboard/users">
          <Card className="group rounded-2xl border transition hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="space-y-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                <Users className="h-5 w-5" />
              </div>

              <div className="space-y-1">
                <h2 className="font-semibold">Users</h2>
                <p className="text-sm text-muted-foreground">
                  Manage users and permissions.
                </p>
              </div>

              <div className="flex items-center text-sm font-medium">
                Open section
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>}


      </section>
    </div>
  );
}