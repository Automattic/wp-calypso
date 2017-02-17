/**
 * Internal dependencies
 */
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { PLAN_FREE } from 'lib/plans/constants';

const isSiteOnFreePlan = ( state, siteId ) => {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return null;
	}

	return currentPlan.productSlug === PLAN_FREE;
};

export default isSiteOnFreePlan;
