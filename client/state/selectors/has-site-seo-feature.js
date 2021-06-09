/**
 * Internal dependencies
 */
import { isEnterprise, FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { hasSiteFeature } from 'calypso/lib/site/utils';
import { createSelector } from 'calypso/../packages/state-utils/src';
import isSiteWPCOMOnFreePlan from 'calypso/state/selectors/is-site-wpcom-on-free-plan';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';

/**
 * Returns true if the site has the SEO feature.
 *
 * @param {object} state Global state tree.
 * @param {number} site The site to check.
 * @returns {boolean} True if the site has the SEO feature, false otherwise.
 */
export default createSelector(
	( state, site = getSelectedSite( state ) ) => {
		if ( state && isSiteWPCOMOnFreePlan( state ) ) {
			return false;
		}

		return (
			hasSiteFeature( site, FEATURE_ADVANCED_SEO ) ||
			( ( site?.plan && isEnterprise( site.plan ) ) ?? undefined )
		);
	},
	( state ) => [ isSiteWPCOMOnFreePlan( state ) ]
);
