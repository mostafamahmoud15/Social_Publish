"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  useStatus,
  useSetPlatformActive,
  useMetaStartUrl,
  useTikTokStartUrl,
  useGetPages,
  useSelectMetaPage,
  useYouTubeStartUrl,
  useYouTubeChannel,
} from "@/hooks/usePlatforms";
import { Platform, PlatformState } from "@/types/types";
import { toastFlow } from "@/lib/toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/getErrorMessage";
import PlatformIcon from "@/components/posts/PlatformIcons/PlatformIcons";

/**
 * Single platform row
 */
function Row({
  platform,
  state,
  onToggle,
  disabled,
}: {
  platform: Platform;
  state: PlatformState;
  onToggle: (next: boolean) => void;
  disabled?: boolean;
}) {
  /**
   * Human-readable platform name
   */
  const title =
    platform === "facebook"
      ? "Facebook"
      : platform === "instagram"
        ? "Instagram"
        : platform === "tiktok"
          ? "TikTok"
          : platform === "youtube"
            ? "YouTube"
            : "X";

  /**
   * Ref to trigger checkbox from the whole row
   */
  const checkboxRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => {
        if (disabled) return;
        checkboxRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (disabled) return;

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          checkboxRef.current?.click();
        }
      }}
      className="w-full flex items-center justify-between rounded-lg border p-4 text-left transition hover:bg-muted/50 disabled:opacity-50 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div onClick={(e) => e.stopPropagation()}>
          {/* Active checkbox */}
          <Checkbox
            ref={checkboxRef}
            checked={state.active}
            disabled={disabled}
            onCheckedChange={(v) => onToggle(v === true)}
          />
        </div>

        {/* Platform icon */}
        <PlatformIcon platform={platform} />

        <div>
          <div className="font-medium">{title}</div>

          {/* Account connection info */}
          <div className="text-xs text-muted-foreground">
            {state.connected ? (
              <>
                Connected:{" "}
                <span className="font-medium text-foreground">
                  {state.accountName ?? ""}
                </span>
              </>
            ) : (
              "Not connected"
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick connect badge if not connected yet */}
        {!state.connected && (
          <Badge
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(true);
            }}
            className="cursor-pointer"
          >
            Connect
          </Badge>
        )}

        {/* Connection status badge */}
        <Badge variant={state.connected ? "default" : "secondary"}>
          {state.connected ? "Connected" : "Not connected"}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Connect platforms page
 */
export default function ConnectPage({ state, platform }: { state?: string; platform?: string }) {
  const { data: status, isLoading } = useStatus();
  const setActive = useSetPlatformActive();
  const startMeta = useMetaStartUrl();
  const startTiktok = useTikTokStartUrl();
  const startYouTube = useYouTubeStartUrl();
  const getYouTubeChannel = useYouTubeChannel();

  /**
   * Prevent handling same OAuth callback more than once
   */
  const handledOAuthRef = React.useRef<string | null>(null);

  // shared busy state
  const [busy, setBusy] = React.useState(false);

  // Meta pages dialog state
  const [open, setOpen] = React.useState(false);

  const router = useRouter();


  /**
   * Load Meta pages after redirect
   */
  const pagesQuery = useGetPages(platform === "meta" ? state : undefined);

  /**
   * Select Meta page mutation
   */
  const selectPage = useSelectMetaPage();

  /**
   * Open page picker dialog when Meta callback exists
   */
  React.useEffect(() => {
    setOpen(platform === "meta" && !!state);
  }, [platform, state]);

  /**
   * Handle connect / disconnect / activate toggle
   */
  const handleToggle = async (platform: Platform, next: boolean) => {
    if (!status) return;

    setBusy(true);

    try {
      const current = status.connections[platform];

      // enable / connect flow
      if (next) {
        if (!current.connected) {
          if (platform === "facebook" || platform === "instagram") {
            const { url } = await startMeta.mutateAsync({ platform });
            window.location.href = url;
            return;
          }

          if (platform === "tiktok") {
            const { url } = await startTiktok.mutateAsync();
            window.location.href = url;
            return;
          }

          if (platform === "youtube") {
            const { url } = await startYouTube.mutateAsync();
            window.location.href = url;
            return;
          }

          if (platform === "x") {
            const { url } = await startYouTube.mutateAsync();
            window.location.href = url;
            return;
          }

          return;
        }

        // already connected → just activate it
        await setActive.mutateAsync({ platform, active: true });
        return;
      }

      // deactivate connected platform
      if (current.connected) {
        await setActive.mutateAsync({ platform, active: false });
      }
    } finally {
      setBusy(false);
    }
  };

  /**
   * Handle YouTube OAuth callback
   */
  React.useEffect(() => {
    const run = async () => {
      if (platform !== "youtube" || !state) return;

      const key = `youtube:${state}`;

      // avoid duplicate execution
      if (handledOAuthRef.current === key) return;

      handledOAuthRef.current = key;

      try {
        await getYouTubeChannel.mutateAsync({ state });
      } finally {
        router.replace("/dashboard/connect");
      }
    };

    run();
  }, [getYouTubeChannel, platform, router, state]);

  // loading state
  if (isLoading || !status) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Connect Platforms</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose platforms to connect</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Facebook row */}
          <Row
            platform="facebook"
            state={status.connections.facebook}
            disabled={busy || setActive.isPending || startMeta.isPending}
            onToggle={(next) => handleToggle("facebook", next)}
          />

          {/* Instagram row */}
          <Row
            platform="instagram"
            state={status.connections.instagram}
            disabled={busy || setActive.isPending || startMeta.isPending}
            onToggle={(next) => handleToggle("instagram", next)}
          />

          {/* TikTok row */}
          <Row
            platform="tiktok"
            state={status.connections.tiktok}
            disabled={busy || setActive.isPending || startMeta.isPending}
            onToggle={(next) => handleToggle("tiktok", next)}
          />

          {/* YouTube row */}
          <Row
            platform="youtube"
            state={status.connections.youtube}
            disabled={busy || setActive.isPending || startMeta.isPending}
            onToggle={(next) => handleToggle("youtube", next)}
          />
        </CardContent>
      </Card>

      {/* Meta page selection dialog */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);

          // clear query params when dialog closes
          if (!v) router.replace("/dashboard/connect");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Facebook Page</DialogTitle>
            <DialogDescription>
              Choose the page you want to connect. This will also detect Instagram business account if linked.
            </DialogDescription>
          </DialogHeader>

          {pagesQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading pages...
            </div>
          ) : pagesQuery.isError ? (
            <div className="text-sm text-red-600">
              Failed to load pages
            </div>
          ) : pagesQuery.data && pagesQuery.data.length === 0 ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>No Facebook pages found for this account.</div>

              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  router.replace("/dashboard/connect");
                }}
              >
                Go Back
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {pagesQuery.data?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.id}</div>
                  </div>

                  {/* Select page button */}
                  <Button
                    disabled={selectPage.isPending}
                    onClick={async () => {
                      if (!state) return;

                      try {
                        const msg = await selectPage.mutateAsync({
                          state,
                          pageId: p.id,
                        });

                        toastFlow.success(msg);
                        setOpen(false);
                        router.replace("/dashboard/connect");
                      } catch (err) {
                        toastFlow.error(getErrorMessage(err));
                      }
                    }}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}