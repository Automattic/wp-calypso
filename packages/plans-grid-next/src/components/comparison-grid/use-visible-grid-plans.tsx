// hooks/use-visible-grid-plans.ts
import { getPlanClass } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
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
	const [ visiblePlans, setVisiblePlans ] = useState< PlanSlug[] >( [] );
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
		setVisiblePlans( ( prev ) => {
			let visibleLength = gridPlans.length;
			let next = prev;

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
			// If a user has an annual business plan and the current term is bienneial, this will find the biennial business plan
			const usersGridPlanFromSelectedTerm = currentSitePlanSlug
				? gridPlans.find(
						( gridPlan ) =>
							getPlanClass( gridPlan.planSlug ) === getPlanClass( currentSitePlanSlug )
				  )
				: null;
			const isCurrentPlanVisible =
				usersGridPlanFromSelectedTerm && next.includes( usersGridPlanFromSelectedTerm.planSlug );
			const isPrevStale = prev.some( ( planSlug ) => ! gridPlansIndex[ planSlug ] );

			// visible length changed, update with the current gridPlans
			if ( prev.length !== visibleLength ) {
				// the user had a selected plan aleady
				if ( currentSitePlanSlug ) {
					// get grid plans where we include the current plan and favor upgrades over downgrades
					next = getSliceOfGridPlans(
						gridPlans,
						gridPlans.findIndex(
							( gridPlan ) =>
								getPlanClass( gridPlan.planSlug ) === getPlanClass( currentSitePlanSlug )
						),
						visibleLength
					).map( ( { planSlug } ) => planSlug );
				} else {
					// no plan selected, just get plans starting at 0
					next = gridPlans.slice( 0, visibleLength ).map( ( { planSlug } ) => planSlug );
				}
			} else if ( isPrevStale ) {
				next = prev.map( ( planSlug ) => {
					const gridPlan = gridPlans.find(
						( gridPlan ) => getPlanClass( gridPlan.planSlug ) === getPlanClass( planSlug )
					);

					return gridPlan?.planSlug ?? planSlug;
				} );
			}

			// Always move the users current plan (or the matching plan from the selected term) to the front of the comparison table
			if ( usersGridPlanFromSelectedTerm && ! isCurrentPlanVisible ) {
				next = [ usersGridPlanFromSelectedTerm.planSlug, ...next ].slice( 0, visibleLength );
			} else if ( usersGridPlanFromSelectedTerm ) {
				const index = next.findIndex(
					( planSlug ) =>
						getPlanClass( planSlug ) === getPlanClass( usersGridPlanFromSelectedTerm.planSlug )
				);
				const removed = next.splice( index, 1 );
				next.unshift( ...removed );
			}

			return next;
		} );
	}, [
		gridSize,
		gridPlans,
		currentSitePlanSlug,
		currentPlanTerm,
		selectedPlanTerm,
		gridPlansIndex,
	] );

	// Update the visible plan slugs when one of the plan selectors is used
	const onPlanChange = useCallback(
		( currentPlan: PlanSlug, event: ChangeEvent< HTMLSelectElement > ) => {
			const newPlan = event.currentTarget.value;
			const newVisiblePlans = visiblePlans.map( ( plan ) =>
				plan === currentPlan ? ( newPlan as PlanSlug ) : plan
			);

			setVisiblePlans( newVisiblePlans );
		},
		[ visiblePlans ]
	);

	// This transforms the array of visible plan slugs into an array of grid plans
	// this is what is actually consumed by the display components
	const visibleGridPlans = useMemo(
		() =>
			visiblePlans.reduce( ( acc, planSlug ) => {
				const gridPlan = gridPlans.find(
					( gridPlan ) => getPlanClass( gridPlan.planSlug ) === getPlanClass( planSlug )
				);

				if ( gridPlan ) {
					acc.push( gridPlan );
				}

				return acc;
			}, [] as GridPlan[] ),
		[ visiblePlans, gridPlans ]
	);

	return { visibleGridPlans, onPlanChange };
}
