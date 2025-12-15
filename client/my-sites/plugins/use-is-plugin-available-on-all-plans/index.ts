import { useSummerSpecialStatus } from '@automattic/plans-grid-next';

interface UseIsPluginAvailableOnAllPlansProps {
	siteId?: number | null;
	isInSignup?: boolean;
}

/**
 * Hook to determine if plugins should be shown as available on all paid plans
 * instead of requiring a specific plan tier.
 *
 * This abstracts the business logic for promotional periods or special offers
 * where plugins become available across all plan tiers.
 *
 * Currently checks for:
 * - Summer Special 2025 promotion (via backend flag or feature flag)
 * - Free sites with the feature flag enabled
 * - Sites with the explicit site option set
 * @param {Object} props - Hook properties
 * @param {number | null} props.siteId - The site ID to check
 * @param {boolean} props.isInSignup - Whether the user is in signup flow
 * @returns {boolean} True if plugins should be shown as available on all plans
 */
export function useIsPluginAvailableOnAllPlans( {
	siteId,
	isInSignup = false,
}: UseIsPluginAvailableOnAllPlansProps = {} ): boolean {
	// Currently, this is driven by the summer special 2025 promotion
	// In the future, additional conditions can be added here for new promotions
	return useSummerSpecialStatus( { siteId, isInSignup } );
}
