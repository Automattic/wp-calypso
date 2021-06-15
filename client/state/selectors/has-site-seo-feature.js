/**
 * Internal dependencies
 */
import { isEnterprise, FEATURE_ADVANCED_SEO, planHasFeature } from '@automattic/calypso-products';
import isSiteWPCOMOnFreePlan from 'calypso/state/selectors/is-site-wpcom-on-free-plan';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';

/**
 * Returns true if the site has the SEO feature, false if the site is WPCOM
 * and on a free plan or doesn't have this feature.
 *
 * @param {object} state Global state tree.
 * @param {number} siteId The id of the site to check.
 * @returns {boolean} True if the site has the SEO feature, false otherwise.
 */
export default ( state, siteId ) => {
	if ( state && siteId && isSiteWPCOMOnFreePlan( state, siteId ) ) {
		return false;
	}

	const currentPlan = getCurrentPlan( state, siteId );

	return (
		planHasFeature( currentPlan?.productSlug, FEATURE_ADVANCED_SEO ) ||
		( ( currentPlan?.productSlug && isEnterprise( currentPlan ) ) ?? undefined )
	);
};
