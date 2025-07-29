import { isSummerSpecialEnabled } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useSelector } from 'react-redux';

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

	// Get summer special status from site options directly from Redux state
	const isSummerSpecialFromSiteOption = useSelector( ( state: any ) => {
		if ( ! siteId ) {
			return false;
		}
		const site = state.sites?.items?.[ siteId ];
		return site?.options?.is_summer_special_2025 ?? false;
	} );

	// Use the pure function for all the logic
	return isSummerSpecialEnabled( {
		isInSignup,
		currentSitePlanSlug,
		isSummerSpecialFromSiteOption: isSummerSpecialFromSiteOption || false,
	} );
}
