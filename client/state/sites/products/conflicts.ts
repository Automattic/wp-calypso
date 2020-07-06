/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { FEATURE_SPAM_AKISMET_PLUS } from 'lib/plans/constants';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	JETPACK_ANTI_SPAM_PRODUCTS,
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
