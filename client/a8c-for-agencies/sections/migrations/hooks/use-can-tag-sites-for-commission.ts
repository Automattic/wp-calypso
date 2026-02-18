import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import {
	A4A_MIGRATED_SITE_TAG,
	A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
	PRESSABLE_LAST_PURCHASE_CUTOFF_DATE,
} from '../lib/constants';

/**
 * Returns true if the user is eligible to see migration tagging based on Pressable usage start_date.
 * If start_date is not found, always allow (show). Otherwise allow only if start_date is on or before the cut-off.
 * E.g. start_date '2025-12-17' (Dec) > cutoff '2025-08-11' (Aug) → false (do not show).
 *      start_date '2025-08-10' (Aug 10) <= cutoff → true (show).
 */
function isWithinPressablePurchaseCutoff( startDate: string | undefined | null ): boolean {
	if ( startDate == null || startDate === '' ) {
		return true;
	}
	const datePart = startDate.slice( 0, 10 );
	return datePart <= PRESSABLE_LAST_PURCHASE_CUTOFF_DATE;
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
