import { useMemo } from '@wordpress/element';
import type { GridPlan } from '@automattic/plans-grid-next';

function usePlanActions( gridPlans: GridPlan[] ) {
	return useMemo( () => {
		return gridPlans.reduce( ( acc, gridPlan ) => {
			return {
				...acc,
				[ gridPlan.planSlug ]: ( isFreeTrialPlan?: boolean ) => {
					console.log( '----aaaaaa', isFreeTrialPlan );
				},
			};
		}, {} );
	}, [ gridPlans ] );
}

export default usePlanActions;
