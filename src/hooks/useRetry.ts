import { queryKeys } from "@/lib/queryKeys";
import { toastFlow } from "@/lib/toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import apiCall from "@/services/apiCall";
import {
  ApiOk,
  Platform,
  RetryPostResponse,
  TikTokSettings,
} from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

type RetryPostResponseType = ApiOk<RetryPostResponse>;

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
    mutationFn: async ({ id, platform, tiktokSettings }) => {
      const { data } = await apiCall.post(
        `/posts/${id}/retry`,
        platform === "tiktok" ? { tiktokSettings } : {},
        {
          params: platform ? { platform } : undefined,
        }
      );

      return data;
    },

    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts });

      const { meta, post } = data;

      if (!post) {
        toastFlow.error("Failed to retry post publishing.");
        return;
      }

      const published = meta?.publishedPlatforms ?? [];
      const failed = meta?.failedPlatforms ?? [];

      if (published.length > 0 && failed.length === 0) {
        toastFlow.success(
          `Post successfully published on: ${published.join(", ")}`
        );
        return;
      }

      if (published.length > 0 && failed.length > 0) {
        const failedWithErrors = failed
          .map((p: Platform) => {
            const err = post.publishResults?.[p]?.error;
            return `${p}${err ? ` (${err})` : ""}`;
          })
          .join(", ");

        toastFlow.warning(
          `Post published on ${published.join(", ")}, but failed on ${failedWithErrors}`
        );
        return;
      }

      if (published.length === 0 && failed.length > 0) {
        const failedWithErrors = failed
          .map((p: Platform) => {
            const err = post.publishResults?.[p]?.error;
            return `${p}${err ? ` (${err})` : ""}`;
          })
          .join(", ");

        toastFlow.error(`Post retry failed on: ${failedWithErrors}`);
        return;
      }

      toastFlow.success("Post retry completed successfully.");
    },

    onError: (err) => {
      toastFlow.error(getErrorMessage(err));
    },
  });
};

export default useRetry;