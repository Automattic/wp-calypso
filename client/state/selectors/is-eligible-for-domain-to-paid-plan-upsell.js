/**
 * Internal dependencies
 */
import { canCurrentUser, isMappedDomainSite, isSiteOnFreePlan, isVipSite } from 'state/selectors';

/**
 * Returns true if the current user is eligible for a domain to paid plan upsell for the site
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @return {?Boolean} True if the user can participate in the domain to paid plan upsell
 */
const isEligibleForDomainToPaidPlanUpsell = ( state, siteId ) => {
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const siteIsOnFreePlan = isSiteOnFreePlan( state, siteId );
	const siteHasMappedDomain = isMappedDomainSite( state, siteId );
	const siteIsVipSite = isVipSite( state, siteId );

	return userCanManageOptions && siteHasMappedDomain && ! siteIsVipSite && siteIsOnFreePlan;
};

export default isEligibleForDomainToPaidPlanUpsell;
