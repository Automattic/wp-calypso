import type { PlanProperties } from '../types';

export function sortPlanProperties(
	planProperties: PlanProperties[],
	currentSitePlanProductSlug?: string
): PlanProperties[] {
	if ( ! currentSitePlanProductSlug ) {
		return planProperties;
	}
	const currentPlanIndex = planProperties.findIndex(
		( properties ) => properties?.planName === currentSitePlanProductSlug
	);

	if ( currentPlanIndex < 0 ) {
		return planProperties;
	}

	const ret = [
		planProperties[ currentPlanIndex ],
		...planProperties.slice( currentPlanIndex + 1 ),
		...planProperties.slice( 0, currentPlanIndex ).sort( ( planA, planB ) => {
			return ( planB?.rawPrice || 0 ) - ( planA?.rawPrice || 0 );
		} ),
	].filter( ( properties ) => Boolean( properties ) );
	return ret;
}
