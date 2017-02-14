/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	canCurrentUser,
	isSiteOnFreePlan,
} from 'state/selectors/';

const eligibleForFreeToPaidUpsell = ( state, siteId ) => {
	return canCurrentUser( state, siteId, 'manage_options' ) && isSiteOnFreePlan( state, siteId );
};

export default eligibleForFreeToPaidUpsell;
