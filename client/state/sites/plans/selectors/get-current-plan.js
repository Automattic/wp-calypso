import { createSelector } from '@automattic/state-utils';
import debugFactory from 'debug';
import { find } from 'lodash';
import { createSitePlanObject } from 'calypso/state/sites/plans/assembler';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { getSite } from 'calypso/state/sites/selectors';

const debug = debugFactory( 'calypso:state:sites:plans:selectors' );

export const getCurrentPlan = createSelector(
	( state, siteId ) => {
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
	},
	( state, siteId ) => [ getPlansBySiteId( state, siteId ), getSite( state, siteId ) ]
);
