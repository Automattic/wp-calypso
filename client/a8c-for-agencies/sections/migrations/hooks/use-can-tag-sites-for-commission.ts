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
 * Returns true if the user is eligible to see migration tagging based on Pressable usage start_date.
 * Eligible if:
 * - start_date is not found (null/empty) → always allow
 * - start_date is on or before 2025-08-11 → allow (existing customers before exclusion period)
 * - start_date is on or after 2026-02-11 → allow (new customers during promo period)
 * Not eligible if start_date falls between 2025-08-12 and 2026-02-10 (exclusion period).
 *
 * Examples:
 * - start_date '2025-08-10' → true (before cutoff)
 * - start_date '2025-12-17' → false (in exclusion period)
 * - start_date '2026-02-11' → true (promo start date)
 * - start_date '2026-02-18' → true (during promo period)
 */
function isWithinPressablePurchaseCutoff( startDate: string | undefined | null ): boolean {
	if ( startDate == null || startDate === '' ) {
		return true;
	}
	const datePart = startDate.slice( 0, 10 );
	return datePart <= PRESSABLE_LAST_PURCHASE_CUTOFF_DATE || datePart >= PRESSABLE_PROMO_START_DATE;
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
