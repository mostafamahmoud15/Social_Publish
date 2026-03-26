"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import apiCall from "@/services/apiCall";
import Cookies from "js-cookie";
import { LoginForm } from "@/types/types";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/getErrorMessage";
import Link from "next/link";

/**
 * Login page
 */
export default function LoginPage() {
    const router = useRouter();

    // server error message
    const [serverError, setServerError] = React.useState<string>("");

    // loading state while submitting
    const [loading, setLoading] = React.useState(false);

    const qc = useQueryClient();

    /**
     * React Hook Form setup
     */
    const form = useForm<LoginForm>({
        defaultValues: { email: "", password: "" },
        mode: "onChange",
    });

    /**
     * Handle form submit
     */
    const onSubmit = async (values: LoginForm) => {
        setServerError("");
        setLoading(true);

        try {
            // call login API
            const { data } = await apiCall.post("/auth/login", values);

            // save token in cookies
            Cookies.set("token", data.data.token);

            // update cached user data
            qc.setQueryData(["me"], data.data.token);

            // redirect to dashboard
            router.push("/dashboard");

        } catch (error) {
            // show readable error message
            const msg = getErrorMessage(error);
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md rounded-2xl">

                <CardHeader>
                    <CardTitle className="text-xl">Sign in</CardTitle>
                    <CardDescription>
                        Use your company account credentials.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">

                    {/* show server error */}
                    {serverError && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Email field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>

                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input
                                            id="email"
                                            placeholder="name@company.com"
                                            type="email"
                                            {...field}
                                        />

                                        {/* validation error */}
                                        {fieldState.error && (
                                            <p className="text-sm text-red-600">
                                                {fieldState.error.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input
                                            id="password"
                                            placeholder="••••••••"
                                            type="password"
                                            {...field}
                                        />

                                        {/* validation error */}
                                        {fieldState.error && (
                                            <p className="text-sm text-red-600">
                                                {fieldState.error.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            />
                        </div>

                        {/* submit button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Login"}
                        </Button>
                    </form>

                    {/* help text */}
                    <p className="text-xs text-muted-foreground">
                        Don’t have an account? Contact the admin to create one.
                    </p>
                </CardContent>
            </Card>
            <div className="mt-6 text-center text-sm text-gray-500">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline text-blue-600">
                    Terms of Service
                </Link>
                and
                <Link href="/privacy" className="underline text-blue-600">
                    Privacy Policy
                </Link>
            </div>
        </div>
    );
}