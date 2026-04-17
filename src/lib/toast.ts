import { toast } from "sonner";

/**
 * Get the same options type used by the Sonner toast
 * so our wrapper supports all toast options.
 */
type SonnerOptions = Parameters<typeof toast>[1];

/**
 * toastFlow
 *
 * A small wrapper around Sonner toast functions.
 * This helps keep toast usage consistent in the app
 * and avoids repeating the same imports everywhere.
 */
export const toastFlow = {

  /**
   * Show loading toast
   */
  loading: (msg: string, options?: SonnerOptions) =>
    toast.loading(msg, options),

  /**
   * Show success toast
   */
  success: (msg: string, options?: SonnerOptions) =>
    toast.success(msg, options),

  /**
   * Show error toast
   */
  error: (msg: string, options?: SonnerOptions) =>
    toast.error(msg, options),

  /**
   * Show warning toast
   */
  warning: (msg: string, options?: SonnerOptions) =>
    toast.warning(msg, options),

  /**
   * Dismiss a specific toast by id
   * or dismiss all toasts if no id is provided
   */
  dismiss: (id?: string | number) =>
    id ? toast.dismiss(id) : toast.dismiss(),
};