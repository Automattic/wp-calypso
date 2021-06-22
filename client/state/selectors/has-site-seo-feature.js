/**
 * Internal dependencies
 */
import { isEnterprise, FEATURE_ADVANCED_SEO, planHasFeature } from '@automattic/calypso-products';
import isSiteWPCOMOnFreePlan from 'calypso/state/selectors/is-site-wpcom-on-free-plan';

/**
 * Returns true if the site has the SEO feature, false if the site is WPCOM
 * and on a free plan or doesn't have this feature.
 *
 * @param {object} state Global state tree.
 * @param {object} site The site to check.
 * @param {number} siteId The id of the site to check.
 * @returns {boolean} True if the site has the SEO feature, false otherwise.
 */
export default ( state, site, siteId ) => {
	if ( state && site && siteId && isSiteWPCOMOnFreePlan( state, site, siteId ) ) {
		return false;
	}

	return (
		planHasFeature( site?.plan?.product_slug, FEATURE_ADVANCED_SEO ) ||
		( ( site?.plan && isEnterprise( site?.plan ) ) ?? undefined )
	);
};
