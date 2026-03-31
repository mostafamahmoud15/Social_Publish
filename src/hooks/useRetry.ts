import { queryKeys } from "@/lib/queryKeys";
import { toastFlow } from "@/lib/toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import apiCall from "@/services/apiCall";
import { ApiOk, CreatePostResponse, Platform, TikTokSettings } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

/**
 * API response type for retry request
 */
type RetryPostResponseType = ApiOk<CreatePostResponse>;


/**
 * useRetry
 *
 * React Query mutation used to retry publishing a post
 * on one or more platforms.
 */
const useRetry = () => {
  const queryClient = useQueryClient();

  return useMutation<
    RetryPostResponseType,
    AxiosError<{ error?: { message?: string }; message?: string }>,
    {
      id: string;
      platform?: Platform;
      tiktokSettings?: TikTokSettings;
    }
  >({
    /**
     * Send retry request to the API
     */
    mutationFn: async ({ id, platform, tiktokSettings }) => {
      const { data } = await apiCall.post(
        `/posts/${id}/retry`,
        platform === "tiktok" ? { tiktokSettings } : {},
        {
          params: platform ? { platform } : undefined,
        }
      );
console.log(data.data);
      return data.data;
    },

    /**
     * Handle successful retry response
     */
    onSuccess: (res) => {
      /**
       * Refresh posts list after retry
       */
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });

      const meta = res?.data?.meta;
      const post = res?.data?.post;

      /**
       * Safety check in case post is missing
       */
      if (!post) {
        toastFlow.error("Failed to retry post publishing.");
        return;
      }

      const published = meta?.publishedPlatforms || [];
      const failed = meta?.failedPlatforms || [];

      /**
       * Case 1: Published on all platforms
       */
      if (published.length && !failed.length) {
        toastFlow.success(
          `Post successfully published on: ${published.join(", ")}`
        );
        return;
      }

      /**
       * Case 2: Partial success
       * Some platforms succeeded and some failed
       */
      if (published.length && failed.length) {
        const errors = failed
          .map((p: "facebook" | "instagram" | "tiktok" | "youtube") => {
            const err = post.publishResults?.[p]?.error;
            return `${p}${err ? ` (${err})` : ""}`;
          })
          .join(", ");

        toastFlow.warning(
          `Post published on ${published.join(", ")}, but failed on ${errors}`
        );
        return;
      }

      /**
       * Case 3: Failed on all platforms
       */
      if (!published.length && failed.length) {
        const errors = failed
          .map((p: "facebook" | "instagram" | "tiktok" | "youtube") => {
            const err = post.publishResults?.[p]?.error;
            return `${p}${err ? ` (${err})` : ""}`;
          })
          .join(", ");

        toastFlow.error(`Post retry failed on: ${errors}`);
        return;
      }

      /**
       * Fallback success message
       */
      toastFlow.success("Post retry completed successfully.");
    },

    /**
     * Handle API error
     */
    onError: (err) => {
      toastFlow.error(getErrorMessage(err));
    },
  });
};

export default useRetry;