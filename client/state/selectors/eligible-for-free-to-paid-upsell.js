/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	canCurrentUser,
	isSiteOnFreePlan,
	isUserRegistrationDaysWithinRange,
} from 'state/selectors/';

const eligibleForFreeToPaidUpsell = ( state, siteId ) => {
	const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const siteIsOnFreePlan = isSiteOnFreePlan( state, siteId );
	const registrationDaysIsWithinRange = isUserRegistrationDaysWithinRange( state, 2, 30 );

	return userCanManageOptions && siteIsOnFreePlan && registrationDaysIsWithinRange;
};

export default eligibleForFreeToPaidUpsell;
