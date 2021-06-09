/**
 * Internal dependencies
 */
import { createSelector } from 'calypso/../packages/state-utils/src';
import { isEnterprise, isVipPlan, FEATURE_GOOGLE_ANALYTICS } from '@automattic/calypso-products';
import { hasSiteFeature } from 'calypso/lib/site/utils';
import isSiteWPCOMOnFreePlan from 'calypso/state/selectors/is-site-wpcom-on-free-plan';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';

/**
 * Returns true if the site has the analytics feature.
 *
 * @param {object} state Global state tree.
 * @param {number} site The site to check.
 * @returns {boolean} True if the site has the analytics feature, false otherwise.
 */
export default createSelector(
	( state, site = getSelectedSite( state ) ) => {
		if ( state && isSiteWPCOMOnFreePlan( state ) ) {
			return false;
		}

		return (
			hasSiteFeature( site, FEATURE_GOOGLE_ANALYTICS ) ||
			( ( site?.plan && ( isEnterprise( site.plan ) || isVipPlan( site.plan ) ) ) ?? undefined )
		);
	},
	( state ) => [ isSiteWPCOMOnFreePlan( state ) ]
);
