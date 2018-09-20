/** @format */

/**
 * Internal dependencies
 */

import canCurrentUser from 'state/selectors/can-current-user';

import isMappedDomainSite from 'state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'state/selectors/is-site-on-free-plan';
import isVipSite from 'state/selectors/is-vip-site';

/**
 * Returns true if the current user is eligible to participate in the free to paid plan upsell for the site
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} True if the user can participate in the free to paid upsell
 */
const isEligibleForFreeToPaidUpsell = ( state, siteId ) => {
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const siteHasMappedDomain = isMappedDomainSite( state, siteId );
	const siteIsOnFreePlan = isSiteOnFreePlan( state, siteId );
	const siteIsVipSite = isVipSite( state, siteId );

	return userCanManageOptions && ! siteHasMappedDomain && siteIsOnFreePlan && ! siteIsVipSite;
};

export default isEligibleForFreeToPaidUpsell;
