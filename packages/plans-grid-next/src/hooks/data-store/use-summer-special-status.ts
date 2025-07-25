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
	// Get current site plan slug directly from the data store
	const { planSlug: currentSitePlanSlug } = Plans.useCurrentPlan( { siteId } ) || {};

	// Get active promotions from Redux state directly
	const activePromotions = useSelector( ( state: any ) => state.activePromotions?.items || [] );

	// Determine summer special status using the existing logic
	const result = isSummerSpecialEnabled( {
		isInSignup,
		currentSitePlanSlug,
		siteId: siteId || undefined,
		activePromotions,
	} );

	return result;
}
