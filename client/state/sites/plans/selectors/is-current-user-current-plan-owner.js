import { get } from 'lodash';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors/get-current-plan';
import { AppState } from 'calypso/types';

/**
 * Returns true if current user is also a current plan owner.
 * @param {AppState} state        Global state tree
 * @param  {number}  siteId       the site id
 * @returns {boolean}			  True when user is a plan owner
 */
export function isCurrentUserCurrentPlanOwner( state, siteId ) {
	const currentPlan = getCurrentPlan( state, siteId );
	return get( currentPlan, 'userIsOwner', false );
}
