import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * JWT secret converted to Uint8Array
 */
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Helper to redirect to a specific path
 */
function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

/**
 * Extract user role from JWT token
 */
async function getRoleFromToken(token: string): Promise<string | undefined> {
  const { payload } = await jwtVerify(token, secretKey);
  return payload.role as string | undefined;
}

/**
 * Main middleware
 * - handle auth redirects
 * - protect dashboard routes
 * - apply role-based access
 */
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  /**
   * Route flags
   */
  const isRootPage = path === "/";
  const isAuthPage = path.startsWith("/login");
  const isDashboard = path.startsWith("/dashboard");

  const isUsersArea = path.startsWith("/dashboard/users");
  const isPostsArea = path.startsWith("/dashboard/posts");
  const isConnectArea = path.startsWith("/dashboard/connect");

  /**
   * Get auth token from cookies
   */
  const token = req.cookies.get("token")?.value;

  /**
   * Handle root page "/"
   * → redirect based on auth state
   */
  if (isRootPage) {
    if (token) {
      try {
        await getRoleFromToken(token);

        // valid token → go to dashboard
        return redirectTo(req, "/dashboard");
      } catch {
        // invalid token → clear and go login
        const response = redirectTo(req, "/login");
        response.cookies.delete("token");
        return response;
      }
    }

    // no token → go login
    return redirectTo(req, "/login");
  }

  /**
   * Protect dashboard routes
   */
  if (isDashboard && !token) {
    return redirectTo(req, "/login");
  }

  /**
   * Prevent logged-in users from accessing login page
   */
  if (isAuthPage && token) {
    try {
      await getRoleFromToken(token);

      // already logged in → redirect dashboard
      return redirectTo(req, "/dashboard");
    } catch {
      // invalid token → clear and allow access
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
  }

  /**
   * Role-based access control
   */
  if ((isUsersArea || isPostsArea || isConnectArea) && token) {
    try {
      const role = await getRoleFromToken(token);

      /**
       * Block normal users from users management
       */
      if (isUsersArea && role === "user") {
        return redirectTo(req, "/dashboard");
      }
    } catch {
      // invalid token → logout
      const response = redirectTo(req, "/login");
      response.cookies.delete("token");
      return response;
    }
  }

  /**
   * Allow request to continue
   */
  return NextResponse.next();
}

/**
 * Apply middleware to:
 * - root "/"
 * - dashboard routes
 * - login page
 */
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};