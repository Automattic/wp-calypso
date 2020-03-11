/**
 * Internal dependencies
 */

import canCurrentUser from 'state/selectors/can-current-user';

import { currentUserHasFlag } from 'state/current-user/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isMappedDomainSite from 'state/selectors/is-mapped-domain-site';
import isSiteOnFreePlan from 'state/selectors/is-site-on-free-plan';
import isVipSite from 'state/selectors/is-vip-site';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
/**
 * Returns true if the current user is eligible to participate in the free to paid plan upsell for the site
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {?boolean} True if the user can participate in the free to paid upsell
 */
const isEligibleForFreeToPaidUpsell = ( state, siteId ) => {
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const siteHasMappedDomain = isMappedDomainSite( state, siteId );
	const siteIsJetpack = isJetpackSite( state, siteId );
	const siteIsOnFreePlan = isSiteOnFreePlan( state, siteId );
	const siteIsVipSite = isVipSite( state, siteId );
	const siteIsDomainOnly = isDomainOnlySite( state, siteId );
	const domainsWithPlansOnly = currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY );

	return (
		userCanManageOptions &&
		! siteHasMappedDomain &&
		siteIsOnFreePlan &&
		! siteIsVipSite &&
		! siteIsJetpack &&
		! siteIsDomainOnly &&
		domainsWithPlansOnly
	);
};

export default isEligibleForFreeToPaidUpsell;
