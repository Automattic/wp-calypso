/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors/get-current-plan';

export function isCurrentPlanExpiring( state, siteId ) {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan || ! currentPlan.expiryDate ) {
		return true;
	}

	const expiration = moment( currentPlan.expiryDate ).startOf( 'day' );
	return expiration < moment().add( 30, 'days' );
}
