// hooks/use-visible-grid-plans.ts
import { getPlanClass } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { usePlansGridContext } from '../../grid-context';
import usePlanBillingPeriod from '../../hooks/data-store/use-plan-billing-period';
import { GridPlan, GridSize, SupportedUrlFriendlyTermType } from '../../types';
import type { PlanSlug } from '@automattic/calypso-products';

interface UseVisibleGridPlansProps {
	gridSize: GridSize | undefined;
	currentSitePlanSlug?: PlanSlug | null;
	siteId: number | null | undefined;
	intervalType: SupportedUrlFriendlyTermType;
}

export function useVisibleGridPlans( {
	gridSize,
	currentSitePlanSlug,
	siteId,
	intervalType,
}: UseVisibleGridPlansProps ) {
	const [ visibleGridPlans, setVisibleGridPlans ] = useState< GridPlan[] >( [] );
	const { gridPlans, gridPlansIndex } = usePlansGridContext();
	const currentPlanTerm = Plans.useCurrentPlanTerm( { siteId } );
	const selectedPlanTerm = usePlanBillingPeriod( { intervalType } );

	// Gets a selection of grid plans, favoring upgrades over downgrades
	const getSliceOfGridPlans = ( array: GridPlan[], i: number, n: number ) => {
		if ( n <= 0 || i < 0 || i >= array.length ) {
			return [];
		}

		const result = [ array[ i ] ]; // Always include the item at index i
		let left = i - 1;
		let right = i + 1;

		// Prefer elements to the right (higher index = greater)
		while ( result.length < n && ( right < array.length || left >= 0 ) ) {
			if ( right < array.length ) {
				result.push( array[ right ] );
				right++;
			}
			// Only add from the left if there is still space and no more right-side items
			if ( result.length < n && left >= 0 ) {
				result.push( array[ left ] );
				left--;
			}
		}

		return result;
	};

	useEffect( () => {
		setVisibleGridPlans( ( prev ) => {
			let visibleLength = gridPlans.length;

			switch ( gridSize ) {
				case 'large':
					visibleLength = 4;
					break;
				case 'medium':
					visibleLength = 3;
					break;
				case 'smedium':
				case 'small':
					visibleLength = 2;
					break;
			}

			// Find the user's current plan in the current term
			const usersGridPlanFromSelectedTerm = currentSitePlanSlug
				? gridPlans.find(
						( gridPlan ) =>
							getPlanClass( gridPlan.planSlug ) === getPlanClass( currentSitePlanSlug )
				  )
				: null;

			// Check if previous state is stale
			const isPrevStale = prev.some( ( plan ) => ! gridPlansIndex[ plan.planSlug ] );

			let next: GridPlan[] = prev;

			// Handle visible length changes
			if ( prev.length !== visibleLength ) {
				// If site has a plan, get a slice of plans that favors upgrades for comparison
				if ( currentSitePlanSlug ) {
					next = getSliceOfGridPlans(
						gridPlans,
						gridPlans.findIndex(
							( gridPlan ) =>
								getPlanClass( gridPlan.planSlug ) === getPlanClass( currentSitePlanSlug )
						),
						visibleLength
					);
				} else {
					next = gridPlans.slice( 0, visibleLength );
				}
			} else if ( isPrevStale ) {
				// Map existing plans to their new term equivalents
				next = prev.map( ( plan ) => {
					const gridPlan = gridPlans.find(
						( gridPlan ) => getPlanClass( gridPlan.planSlug ) === getPlanClass( plan.planSlug )
					);
					return gridPlan ?? plan;
				} );
			}

			// Ensure current plan is visible and at the start
			if ( usersGridPlanFromSelectedTerm ) {
				const isCurrentPlanVisible = next.some(
					( plan ) =>
						getPlanClass( plan.planSlug ) === getPlanClass( usersGridPlanFromSelectedTerm.planSlug )
				);

				if ( ! isCurrentPlanVisible ) {
					next = [ usersGridPlanFromSelectedTerm, ...next ].slice( 0, visibleLength );
				} else {
					const index = next.findIndex(
						( plan ) =>
							getPlanClass( plan.planSlug ) ===
							getPlanClass( usersGridPlanFromSelectedTerm.planSlug )
					);
					const [ removed ] = next.splice( index, 1 );
					next.unshift( removed );
				}
			}

			return next;
		} );
	}, [ gridSize, gridPlans, currentSitePlanSlug, currentPlanTerm, selectedPlanTerm ] );

	const onPlanChange = useCallback(
		( currentPlan: PlanSlug, event: ChangeEvent< HTMLSelectElement > ) => {
			const newPlanSlug = event.currentTarget.value;
			const newPlan = gridPlans.find( ( plan ) => plan.planSlug === newPlanSlug );

			if ( newPlan ) {
				setVisibleGridPlans( ( prev ) =>
					prev.map( ( plan ) => ( plan.planSlug === currentPlan ? newPlan : plan ) )
				);
			}
		},
		[ gridPlans ]
	);

	return { visibleGridPlans, onPlanChange };
}
