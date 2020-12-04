/**
 * External dependencies
 */
import { find } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getSite } from 'calypso/state/sites/selectors';
import { createSitePlanObject } from 'calypso/state/sites/plans/assembler';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';

/**
 * Module dependencies
 */
const debug = debugFactory( 'calypso:state:sites:plans:selectors' );

export function getCurrentPlan( state, siteId ) {
	const plans = getPlansBySiteId( state, siteId );
	if ( plans.data ) {
		const currentPlan = find( plans.data, 'currentPlan' );

		if ( currentPlan ) {
			debug( 'current plan: %o', currentPlan );
			return currentPlan;
		}

		const site = getSite( state, siteId );
		const plan = createSitePlanObject( site.plan );
		debug( 'current plan: %o', plan );
		return plan;
	}
	return null;
}
