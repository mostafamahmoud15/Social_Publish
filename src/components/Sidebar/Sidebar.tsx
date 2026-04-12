"use client";
import useMe from "../../hooks/useMe";
import { cn } from "../../lib/utils";
import {
  Home,
  LayoutGrid,
  ListCollapse,
  LogOut,
  Menu,
  Plug,
  Users,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { NavItem, NavListType } from "../../types/types";
import { Role } from "@/constant/constant";

// Define all sidebar navigation items with roles allowed to see them
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: [Role.OWNER, Role.USER] },
  { href: "/dashboard/posts", label: "Posts", icon: LayoutGrid, roles: [Role.OWNER, Role.USER] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: [Role.OWNER] },
  { href: "/dashboard/connect", label: "Connect Accounts", icon: Plug, roles: [Role.OWNER, Role.USER] },
];

// Helper function to check if current route is active
function isActivePath(pathname: string, href: string) {
  // remove trailing slashes to avoid mismatch
  const normalize = (path: string) => path.replace(/\/+$/, "");

  const current = normalize(pathname);
  const target = normalize(href);

  // special case for dashboard root
  if (target === "/dashboard") {
    return current === "/dashboard";
  }

  // match exact or nested routes
  return current === target || current.startsWith(target);
}

// Component responsible for rendering nav items list
function NavList({
  items,
  pathname,
  expanded,
  onNavigate,
}: NavListType) {
  return (
    <ul className="flex-1 space-y-2 overflow-y-auto p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate} // useful for closing mobile menu
              className={cn(
                // base styles
                "group flex w-full items-center rounded-xl border px-3 py-2.5 text-sm transition-all",

                // active vs inactive styles
                active
                  ? "border-gray-300 bg-gray-200 text-black"
                  : "border-transparent bg-[#f6f6f6] text-gray-700 hover:bg-gray-200"
              )}
            >
              {/* icon container */}
              <div className="flex min-w-8 justify-center">
                <Icon className="h-4 w-4" />
              </div>

              {/* label (collapses when sidebar is minimized) */}
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
                  expanded ? "ml-3 max-w-48 opacity-100" : "ml-0 max-w-0 opacity-0"
                )}
              >
                {label}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar() {
  // controls sidebar width (collapsed / expanded)
  const [expanded, setExpanded] = useState(true);

  // controls mobile drawer visibility
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // react-query client (used to clear cache on logout)
  const qc = useQueryClient();

  // get current user data
  const { data, isLoading } = useMe();
  const user = data?.data?.user;

  // filter nav items based on user role
  const filteredNavItems = useMemo(() => {
    if (!user) return [];

    return navItems.filter((item) =>
      item.roles.includes(user.role as Role.OWNER | Role.USER)
    );
  }, [user]);

  // handle logout logic
  function logout() {
    Cookies.remove("token"); // remove auth token
    qc.clear(); // clear cached queries
    router.push("/login"); // redirect to login page
  }

  return (
    <>
      {/* ================= Desktop Sidebar ================= */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen border-r bg-white md:flex md:flex-col transition-[width] duration-300 ease-in-out",
          expanded ? "w-72" : "w-20" // width changes when collapsed
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header section */}
          <div className="border-b p-3">
            <div className="flex items-center justify-between gap-2">
              {/* App title (hidden when collapsed) */}
              <div
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
                  expanded ? "max-w-42 opacity-100" : "max-w-0 opacity-0"
                )}
              >
                <h2 className="text-sm font-semibold">Benaa Social Publisher</h2>
                <p className="text-xs text-muted-foreground">Dashboard Panel</p>
              </div>

              {/* Collapse / expand button */}
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className="rounded-xl p-2 transition hover:bg-muted"
                aria-label="Toggle sidebar"
              >
                <ListCollapse className="h-4 w-4" />
              </button>
            </div>

            {/* User info (hidden when collapsed) */}
            <div
              className={cn(
                "mt-3 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out",
                expanded ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {isLoading ? (
                // simple skeleton loader
                <div className="space-y-2">
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                </div>
              ) : (
                <div className="space-y-1">
                  {/* user role badge */}
                  <span className="inline-block rounded-md bg-[#f2f2f2] px-2 py-1 text-xs font-medium">
                    {user?.role ?? ""}
                  </span>

                  {/* user email */}
                  <p className="text-xs text-gray-600 break-all">
                    {user?.email ?? ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation items */}
          <NavList
            items={filteredNavItems}
            pathname={pathname}
            expanded={expanded}
          />

          {/* Logout button */}
          <div className="mt-auto border-t p-3">
            <button
              onClick={logout}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-200"
            >
              <div className="flex min-w-8 justify-center">
                <LogOut className="h-4 w-4" />
              </div>

              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-200",
                  expanded ? "ml-3 max-w-48 opacity-100" : "ml-0 max-w-0 opacity-0"
                )}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ================= Mobile Top Bar ================= */}
      <div className="sticky top-0 z-30 border-b bg-white px-3 py-2 md:hidden">
        <button
          onClick={() => setMobileOpen(true)} // open drawer
          className="rounded-lg p-2 transition hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Dark overlay behind drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)} // close when clicking outside
      />

      {/* ================= Mobile Drawer ================= */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-sm font-semibold">Benaa Social Publisher</h2>
            <p className="text-xs text-muted-foreground">Dashboard Panel</p>
          </div>

          {/* Close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 transition hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b px-4 py-3">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-sm font-medium">{user?.role ?? ""}</div>
              <div className="break-all text-xs text-gray-600">
                {user?.email ?? ""}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <NavList
          items={filteredNavItems}
          pathname={pathname}
          expanded={true}
          onNavigate={() => setMobileOpen(false)} // close after navigation
        />

        {/* Logout */}
        <div className="mt-auto shrink-0 border-t p-3">
          <button
            onClick={logout}
            className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-200"
            aria-label="Logout"
          >
            <div className="flex min-w-8 justify-center">
              <LogOut className="h-5 w-5" />
            </div>

            <span className="ml-3 whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}