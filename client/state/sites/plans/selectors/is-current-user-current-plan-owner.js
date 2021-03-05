/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors/get-current-plan';

/**
 * Returns true if current user is also a current plan owner.
 *
 * @param  {object}  state        global state
 * @param  {number}  siteId       the site id
 * @returns {boolean}			  True when user is a plan owner
 */
export function isCurrentUserCurrentPlanOwner( state, siteId ) {
	const currentPlan = getCurrentPlan( state, siteId );

	return get( currentPlan, 'userIsOwner', false );
}
