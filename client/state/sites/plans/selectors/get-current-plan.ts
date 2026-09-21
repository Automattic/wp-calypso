import debugFactory from 'debug';
import { createSitePlanObject } from 'calypso/state/sites/plans/assembler';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';
import { default as getSite } from 'calypso/state/sites/selectors/get-site';
import type { SitePlanData } from 'calypso/state/sites/plans/types';
import type { AppState } from 'calypso/types';

const debug = debugFactory( 'calypso:state:sites:plans:selectors' );

export function getCurrentPlan(
	state: AppState,
	siteId: number | null | undefined
): SitePlanData | null {
	const plans = getPlansBySiteId( state, siteId ?? undefined );
	if ( plans.data ) {
		const currentPlan = plans.data.find( ( plan ) => plan.currentPlan );

		if ( currentPlan ) {
			debug( 'current plan: %o', currentPlan );
			return currentPlan;
		}

		const site = getSite( state, siteId );
		if ( ! site ) {
			return null;
		}
		const plan = createSitePlanObject( site.plan );
		debug( 'current plan: %o', plan );
		return plan;
	}
	return null;
}
