"use client";

import { Controller, useWatch } from "react-hook-form";
import {
  SendHorizonal,
  Settings2,
} from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformRowProps, PostTargetsSectionProps } from "@/types/types";

/**
 * Single platform row
 */
function PlatformRow({
  label,
  checked,
  disabled = false,
  connected,
  connectedLabel = "Connected",
  disconnectedLabel = "Not connected",
  hint,
  icon,
  onChange,
}: PlatformRowProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition",
        checked ? "border-black bg-muted/40" : "border-border bg-white",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Platform checkbox */}
          <Checkbox
            checked={checked}
            disabled={disabled}
            onCheckedChange={(value) => onChange(Boolean(value))}
          />

          {/* Platform icon */}
          {icon && (
            <div className="mt-0.5 text-muted-foreground">
              {icon}
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm font-medium">{label}</div>

            {/* Small helper text */}
            {hint && (
              <p className="text-xs text-muted-foreground">{hint}</p>
            )}
          </div>
        </div>

        {/* Connection status */}
        <Badge
          variant={connected ? "default" : "secondary"}
          className="rounded-full"
        >
          {connected ? connectedLabel : disconnectedLabel}
        </Badge>
      </div>
    </div>
  );
}

/**
 * Post targets section
 */
export default function PostTargetsSection({
  form,
  conn,
  isSubmitting,
  onPublish,
  onSaveDraft,
}: PostTargetsSectionProps) {
  const {
    control,
    formState: { errors },
  } = form;

  /**
   * Watch selected media type
   */
  const kind = useWatch({
    control,
    name: "media.kind",
    defaultValue: "images",
  });


  /**
   * TikTok and YouTube are video-only platforms,
   * so we disable them when the user selects images.
   */
  const tiktokDisabled = kind === "images";
  const youtubeDisabled = kind === "images";

  return (
    <Card className="rounded-3xl border bg-white shadow-sm">
      <CardContent className="space-y-5 p-5 md:p-6">
        {/* Section title */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          Choose where to publish
        </div>

        {/* Platform list */}
        <div className="grid gap-3">
          <Controller
            control={control}
            name="targets.facebook"
            render={({ field }) => (
              <PlatformRow
                label="Facebook"
                checked={!!field.value}
                connected={conn.metaConnected}
                connectedLabel="Connected (Meta)"
                disconnectedLabel="Connect Meta"
                hint="Share this post to Facebook."
                icon={<FaFacebook className="h-5 w-5 text-[#1877F2]" />}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />

          <Controller
            control={control}
            name="targets.instagram"
            render={({ field }) => (
              <PlatformRow
                label="Instagram"
                checked={!!field.value}
                connected={conn.metaConnected}
                connectedLabel="Connected (Meta)"
                disconnectedLabel="Connect Meta"
                hint="Post your content to Instagram."
                icon={<FaInstagram className="h-5 w-5 text-[#E1306C]" />}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />

          <Controller
            control={control}
            name="targets.tiktok"
            render={({ field }) => (
              <PlatformRow
                label="TikTok"
                checked={!!field.value}
                disabled={tiktokDisabled}
                connected={conn.tiktokConnected}
                connectedLabel="Connected"
                disconnectedLabel="Connect TikTok"
                hint={
                  tiktokDisabled
                    ? "TikTok requires video media."
                    : "Publish your video to TikTok. Privacy is set to Public automatically."
                }
                icon={<FaTiktok className="h-5 w-5 text-black" />}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />

          <Controller
            control={control}
            name="targets.youtube"
            render={({ field }) => (
              <PlatformRow
                label="YouTube"
                checked={!!field.value}
                disabled={youtubeDisabled}
                connected={conn.youtubeConnected}
                connectedLabel="Connected"
                disconnectedLabel="Connect YouTube"
                hint={
                  youtubeDisabled
                    ? "YouTube requires video media."
                    : "Publish your video to YouTube. Privacy is set to Public automatically."
                }
                icon={<FaYoutube className="h-5 w-5 text-[#FF0000]" />}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
        </div>

        {/* Form-level targets error */}
        {errors.targets?.message && (
          <p className="text-sm text-red-600">{errors.targets.message}</p>
        )}

        {/* Actions */}
        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={onPublish}
            className="h-11 rounded-xl"
          >
            <SendHorizonal className="mr-2 h-4 w-4" />
            Publish Now
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onSaveDraft}
            className="h-11 rounded-xl"
          >
            Save Draft
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}