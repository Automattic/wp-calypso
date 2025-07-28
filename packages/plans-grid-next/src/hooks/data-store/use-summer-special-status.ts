import { isSummerSpecialEnabled } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { getSiteOption } from '@automattic/data-stores/src/site/selectors';
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

	// Get summer special status from site options using the getSiteOption selector
	const isSummerSpecialFromSiteOption = useSelector( ( state: any ) => {
		if ( ! siteId ) {
			return false;
		}
		return ( getSiteOption( state, siteId, 'is_summer_special_2025' ) as boolean ) ?? false;
	} );

	// Use the pure function for all the logic
	return isSummerSpecialEnabled( {
		isInSignup,
		currentSitePlanSlug,
		isSummerSpecialFromSiteOption: isSummerSpecialFromSiteOption || false,
	} );
}
