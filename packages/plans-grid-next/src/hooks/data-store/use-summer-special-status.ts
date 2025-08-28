import { isSummerSpecialEnabled } from '@automattic/calypso-products';
import { Plans, Site } from '@automattic/data-stores';

interface UseSummerSpecialStatusProps {
	isInSignup?: boolean;
	siteId?: number | null;
}

export function useSummerSpecialStatus( {
	isInSignup = false,
	siteId,
}: UseSummerSpecialStatusProps = {} ): boolean {
	// Get current site plan slug
	const { planSlug: currentSitePlanSlug } = Plans.useCurrentPlan( { siteId } ) || {};

	// Get summer special status from site options using the useSite hook
	const { data: site } = Site.useSite( { siteIdOrSlug: siteId } );
	const isSummerSpecialFromSiteOption = site?.options?.is_summer_special_2025 ?? false;

	// Use the pure function for all the logic
	return isSummerSpecialEnabled( {
		isInSignup,
		currentSitePlanSlug,
		isSummerSpecialFromSiteOption,
	} );
}
