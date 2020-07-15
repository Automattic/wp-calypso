/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import {
	FEATURE_SPAM_AKISMET_PLUS,
	JETPACK_PLANS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
} from 'lib/plans/constants';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from 'lib/products-values/constants';
import { hasFeature } from 'state/sites/plans/selectors';
import isSiteWPCOM from 'state/selectors/is-site-wpcom';
import { hasSiteProduct } from 'state/sites/selectors';

/**
 * Type dependencies
 */
import type { AppState } from 'types';

/**
 * Checks if Jetpack Anti-Spam is conflicting with a site's current products.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @returns {boolean|null} True for conflict, or null when it's unable to be determined.
 */
export const isAntiSpamConflicting = createSelector(
	( state: AppState, siteId: number ): boolean | null => {
		const planHasFeature = hasFeature( state, siteId, FEATURE_SPAM_AKISMET_PLUS );
		const isWPCOM = isSiteWPCOM( state, siteId );
		const hasAntiSpam = hasSiteProduct( state, siteId, JETPACK_ANTI_SPAM_PRODUCTS );
		return planHasFeature || isWPCOM || hasAntiSpam;
	},
	[
		( state: AppState, siteId: number ) => [
			hasFeature( state, siteId, FEATURE_SPAM_AKISMET_PLUS ),
			isSiteWPCOM( state, siteId ),
			hasSiteProduct( state, siteId, JETPACK_ANTI_SPAM_PRODUCTS ),
		],
	]
);

/**
 * Check if a given product conflicts with an existing site purchase.
 *
 * @param {AppState} state The redux state.
 * @param {number|null} siteId Either the site ID, or null.
 * @param {string} productSlug The product slug.
 * @returns {boolean|null} True or false, or null when it's unable to be determined.
 */
export default function isProductConflictingWithSite(
	state: AppState,
	siteId: number | null,
	productSlug: string
): boolean | null {
	if ( ! siteId ) {
		return null;
	}

	switch ( productSlug ) {
		case PRODUCT_JETPACK_ANTI_SPAM:
		case PRODUCT_JETPACK_ANTI_SPAM_MONTHLY:
			return isAntiSpamConflicting( state, siteId );
	}
	return null;
}

export function isPlanIncludingSiteBackup(
	state: AppState,
	siteId: number | null,
	productSlug: string
): boolean | null {
	// TODO: use createSelector
	// value_bundle

	if ( ! siteId || ! JETPACK_PLANS.includes( productSlug ) ) {
		return null;
	}

	const hasDailyBackup = hasSiteProduct( state, siteId, [
		PRODUCT_JETPACK_BACKUP_DAILY,
		PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	] );
	const hasRealTimeBackup = hasSiteProduct( state, siteId, [
		PRODUCT_JETPACK_BACKUP_REALTIME,
		PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	] );

	if ( ! hasDailyBackup && ! hasRealTimeBackup ) {
		return false;
	}

	switch ( productSlug ) {
		case PLAN_JETPACK_FREE:
			return false;
		case PLAN_JETPACK_PERSONAL:
		case PLAN_JETPACK_PERSONAL_MONTHLY:
		case PLAN_JETPACK_PREMIUM:
		case PLAN_JETPACK_PREMIUM_MONTHLY:
			if ( hasRealTimeBackup ) {
				return false;
			}
			return true;
		case PLAN_JETPACK_BUSINESS:
		case PLAN_JETPACK_BUSINESS_MONTHLY:
			return true;
	}

	return null;
}
