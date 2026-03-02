/**
 * Hook to determine if plugins should be shown as available on all paid plans
 * instead of requiring a specific plan tier.
 *
 * Since the Summer Special 2025 promotion was made permanent, plugins are now
 * unconditionally available on all paid plans (Personal, Premium, etc.).
 *
 * @returns {boolean} True if plugins should be shown as available on all plans
 */
export function useIsPluginAvailableOnAllPlans(): boolean {
	return true;
}
