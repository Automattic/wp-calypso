import { getPlanClass } from '@automattic/calypso-products';
import { useEffect, useMemo, useState } from 'react';
import { usePlansGridContext } from '../../../grid-context';
import { GridPlan } from '../../../types';

/**
 *When plan changes occur, the visible plan order may need to be updated to reflect the new plans.
 *we must detect this prop change and transform the current visible plan order into a set of plans
 *that align with the currently selected plan interval without causing glitches or flashes.
 *
 *This hook serves as the solution. The hook accomplishes two main tasks:
 *- Resolves the correct visible plan order, providing it immediately in the current render cycle to prevent glitches.
 *- Updates the local state with the most up-to-date plan order as required.
 * @returns The list of gridPlans in the accurate display configuration.
 */
function useVisibleGridPlans(): {
	visibleGridPlans: GridPlan[];
	setVisibleGridPlans: ( visibleGridPlans: GridPlan[] ) => void;
} {
	const { gridPlansIndex, gridPlans } = usePlansGridContext();
	const [ visibleGridPlans, setVisibleGridPlans ] = useState(
		gridPlans.map( ( gridPlan ) => gridPlan )
	);
	const refreshedVisibleGridPlans = useMemo( () => {
		let newPlans: GridPlan[] | undefined;
		/**
		 * If at least one planSlug in the visibleGridPlanState state is not present in the current gridPlansIndex,
		 * it indicates that the visibleGridPlanState is now stale most probably due to a change in the interval.
		 */
		const [ firstVisibleGridPlan ] = visibleGridPlans;
		if ( ! gridPlansIndex[ firstVisibleGridPlan.planSlug ] ) {
			newPlans = visibleGridPlans.map(
				( stalePlan ) =>
					gridPlans.find(
						( newPlan ) => getPlanClass( newPlan.planSlug ) === getPlanClass( stalePlan.planSlug )
					) ?? stalePlan
			);
		}
		return newPlans;
	}, [ gridPlans, gridPlansIndex, visibleGridPlans ] );

	useEffect( () => {
		if ( refreshedVisibleGridPlans ) {
			setVisibleGridPlans( refreshedVisibleGridPlans );
		}
	}, [ refreshedVisibleGridPlans ] );

	return { visibleGridPlans: refreshedVisibleGridPlans ?? visibleGridPlans, setVisibleGridPlans };
}
export default useVisibleGridPlans;
