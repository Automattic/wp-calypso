/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	canCurrentUser,
	isMappedDomainSite,
	isSiteOnFreePlan,
	isUserRegistrationDaysWithinRange,
} from 'state/selectors/';

const eligibleForFreeToPaidUpsell = ( state, siteId ) => {
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const siteHasMappedDomain = isMappedDomainSite( state, siteId );
	const siteIsOnFreePlan = isSiteOnFreePlan( state, siteId );
	const registrationDaysIsWithinRange = isUserRegistrationDaysWithinRange( state, 2, 30 );

	return userCanManageOptions && ! siteHasMappedDomain && siteIsOnFreePlan && registrationDaysIsWithinRange;
};

export default eligibleForFreeToPaidUpsell;
