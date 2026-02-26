import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import {
	A4A_MIGRATED_SITE_TAG,
	A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
	PRESSABLE_LAST_PURCHASE_CUTOFF_DATE,
	PRESSABLE_PROMO_START_DATE,
} from '../lib/constants';

/**
 * Returns true if the agency is eligible to see migration tagging based on Pressable usage start_date.
 * Show tagging if:
 * - No start_date (never bought) → show.
 * - start_date on or before PRESSABLE_LAST_PURCHASE_CUTOFF_DATE (bought before the gap) → show.
 * - start_date on or after PRESSABLE_PROMO_START_DATE (bought when promo started, new customer) → show.
 * Hide tagging if start_date is in the gap (after cutoff and before promo start).
 */
function isWithinPressablePurchaseCutoff( startDate: string | undefined | null ): boolean {
	if ( startDate == null || startDate === '' ) {
		return true;
	}
	const datePart = startDate.slice( 0, 10 );
	// Bought on or before Aug 10, 2025 → eligible.
	if ( datePart <= PRESSABLE_LAST_PURCHASE_CUTOFF_DATE ) {
		return true;
	}
	// Bought on or after promo start (Feb 11, 2026) → eligible (new customer during promo).
	if ( datePart >= PRESSABLE_PROMO_START_DATE ) {
		return true;
	}
	// Bought in the gap (Aug 11, 2025 – Feb 10, 2026) → not eligible.
	return false;
}

export default function useCanTagSitesForCommission(): {
	canTagSitesForCommission: boolean;
	migrationTags: string[];
} {
	const activeAgency = useSelector( getActiveAgency );

	const pressableUsageStartDate = activeAgency?.third_party?.pressable?.usage?.start_date;
	const withinPurchaseCutoff = isWithinPressablePurchaseCutoff( pressableUsageStartDate );

	return useMemo( () => {
		const canTagSitesForCommission = withinPurchaseCutoff;
		const migrationTags = [
			A4A_MIGRATED_SITE_TAG,
			...( canTagSitesForCommission ? [ A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026 ] : [] ),
		];
		return {
			canTagSitesForCommission,
			migrationTags,
		};
	}, [ withinPurchaseCutoff ] );
}
