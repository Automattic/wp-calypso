/**
 * Internal dependencies
 */
import {
	canCurrentUser,
	isMappedDomainSite,
	isSiteOnFreePlan,
	isUserRegistrationDaysWithinRange,
} from 'state/selectors/';

/**
 * Returns true if the current user is eligible to participate in the free to paid plan upsell for the site
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} moment Current moment for determination of elapsed days since registration
 * @return {?Boolean} True if the user can participate in the free to paid upsell
 */
const eligibleForFreeToPaidUpsell = ( state, siteId, moment ) => {
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const siteHasMappedDomain = isMappedDomainSite( state, siteId );
	const siteIsOnFreePlan = isSiteOnFreePlan( state, siteId );
	const registrationDaysIsWithinRange = isUserRegistrationDaysWithinRange( state, moment, 0, 180 );

	return userCanManageOptions && ! siteHasMappedDomain && siteIsOnFreePlan && registrationDaysIsWithinRange;
};

export default eligibleForFreeToPaidUpsell;
