/**
 * Internal dependencies
 */

import canCurrentUser from 'calypso/state/selectors/can-current-user';

import isMappedDomainSite from 'calypso/state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import isVipSite from 'calypso/state/selectors/is-vip-site';

/**
 * Returns true if the current user is eligible for a domain to paid plan upsell for the site
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} True if the user can participate in the domain to paid plan upsell
 */
const isEligibleForDomainToPaidPlanUpsell = ( state, siteId ) => {
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const siteIsOnFreePlan = isSiteOnFreePlan( state, siteId );
	const siteHasMappedDomain = isMappedDomainSite( state, siteId );
	const siteIsVipSite = isVipSite( state, siteId );

	return userCanManageOptions && siteHasMappedDomain && ! siteIsVipSite && siteIsOnFreePlan;
};

export default isEligibleForDomainToPaidPlanUpsell;
