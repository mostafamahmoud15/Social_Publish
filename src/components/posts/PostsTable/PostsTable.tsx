"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMemo, useState } from "react";
import PlatformBadges from "../PlatformBadges/PlatformBadges";
import StatusBadge from "../StatusBadge/StatusBadge";
import useRetry from "@/hooks/useRetry";
import { Platform, PostTableProps, PrivacyLevel } from "@/types/types";
import { canRetryPlatform, getPostPlatforms, hasAnyRetry, prettyPlatform } from "./helpers";
import PlatformResultRow from "./PlatformResult";
import useDeletePost from "@/hooks/useDeletePost";
import ConfirmActionButton from "../../shared/DeleteModal";

export default function PostsTable({ posts }: PostTableProps) {
  // mutation for retrying publish
  const retry = useRetry();

  // mutation for deleting post
  const deletePostMutation = useDeletePost();

  // fallback to empty array if no posts
  const items = useMemo(() => posts?.items ?? [], [posts]);

  // currently busy post id while retry is running
  const busyId = retry.variables?.id;


  // details dialog state for showing full error
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState<{
    postId: string;
    platform: Platform;
    error: string;
  } | null>(null);

  // default TikTok retry settings
  const DEFAULT_TIKTOK_SETTINGS = {
    privacy_level: "PUBLIC_TO_EVERYONE" as const,
    disable_comment: false,
    disable_duet: false,
    disable_stitch: false,
  };

  // retry one or all platforms
  const doRetry = (id: string, platform?: Platform) => {
    retry.mutate({
      id,
      platform,
      ...(platform === "tiktok" && {
        tiktokSettings: {
          privacy_level: "PUBLIC_TO_EVERYONE",
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
      }),
      ...(platform === "youtube" && {
        youtubeSettings: {
          privacyStatus: "public",
        },
      }),
    });
  };

  // open dialog with full error details
  const openDetails = (postId: string, platform: Platform, error: string | null) => {
    setDetails({ postId, platform, error: String(error || "") });
    setDetailsOpen(true);
  };


  // special handling for TikTok retry
  const handlePlatformRetry = (postId: string, platform: Platform) => {
    doRetry(postId, platform);
  };

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[320px]">Content</TableHead>
            <TableHead className="w-40">Platforms</TableHead>
            <TableHead className="w-30">Status</TableHead>
            <TableHead className="w-105">Results</TableHead>
            <TableHead className="w-55 text-right">Created</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((post) => {
            // this post is currently being retried
            const isBusy = retry.isPending && busyId === post._id;

            // this post is currently being deleted
            const isDeleting =
              deletePostMutation.isPending &&
              deletePostMutation.variables?.id === post._id;

            return (
              <TableRow key={post._id}>
                {/* post content */}
                <TableCell className="align-top">
                  <div className="text-sm font-medium truncate">
                    {post.caption || "—"}
                  </div>

                  <div className="text-xs text-muted-foreground truncate">
                    {(post.hashtags || [])
                      .map((h: string) => (h.startsWith("#") ? h : `#${h}`))
                      .join(" ")}
                  </div>

                  {/* retry all failed platforms */}
                  {hasAnyRetry(post) && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => doRetry(post._id)}
                      >
                        {isBusy ? "Retrying..." : "Retry failed platforms"}
                      </Button>
                    </div>
                  )}
                </TableCell>

                {/* selected platforms */}
                <TableCell className="align-top">
                  <PlatformBadges targets={post.targets} />
                </TableCell>

                {/* overall post status */}
                <TableCell className="align-top">
                  <StatusBadge status={post.status} />
                </TableCell>

                {/* per-platform publish results */}
                <TableCell className="align-top space-y-3">
                  {getPostPlatforms(post).map((platform) => {
                    const canRetry = canRetryPlatform(post, platform);

                    return (
                      <PlatformResultRow
                        key={platform}
                        post={post}
                        platform={platform}
                        isBusy={isBusy}
                        canRetry={canRetry}
                        onRetry={() => handlePlatformRetry(post._id, platform)}
                        onViewDetails={() =>
                          openDetails(post._id, platform, post.publishResults?.[platform]?.error)
                        }
                      />
                    );
                  })}
                </TableCell>

                {/* created at */}
                <TableCell className="align-top text-right text-sm text-muted-foreground">
                  {format(new Date(post.createdAt), "PPpp")}
                </TableCell>

                {/* delete action */}
                <TableCell className="align-top text-right">
                  <ConfirmActionButton
                    triggerText="Delete"
                    triggerProps={{ variant: "destructive", size: "sm" }}
                    title="Delete post"
                    description="Are you sure you want to delete this post? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isDeleting}
                    onConfirm={() => deletePostMutation.mutateAsync({ id: post._id })}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* dialog for showing full publish error */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {details ? `${prettyPlatform(details.platform)} publish error` : "Publish error"}
            </DialogTitle>
          </DialogHeader>

          {details && (
            <div className="space-y-2">
              <pre className="text-xs whitespace-pre-wrap rounded-lg bg-muted p-3 max-h-90 overflow-auto">
                {details.error}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}