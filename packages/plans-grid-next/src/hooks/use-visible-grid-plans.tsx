// hooks/use-visible-grid-plans.ts
import { getPlanClass } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useState, useEffect } from 'react';
import { usePlansGridContext } from '../grid-context';
import { GridPlan, GridSize, SupportedUrlFriendlyTermType } from '../types';
import usePlanBillingPeriod from './data-store/use-plan-billing-period';
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

	useEffect( () => {
		setVisibleGridPlans( ( previousGridPlans ) => {
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
			const isPreviousGridPlansStale = previousGridPlans.some(
				( plan ) => ! gridPlansIndex[ plan.planSlug ]
			);

			let nextGridPlans: GridPlan[] = previousGridPlans;

			if ( previousGridPlans.length !== visibleLength ) {
				nextGridPlans = gridPlans.slice( 0, visibleLength );
			} else if ( isPreviousGridPlansStale ) {
				// Map existing plans to their new term equivalents, preserving order
				nextGridPlans = previousGridPlans.map( ( plan ) => {
					const gridPlan = gridPlans.find(
						( gridPlan ) => getPlanClass( gridPlan.planSlug ) === getPlanClass( plan.planSlug )
					);
					return gridPlan ?? plan;
				} );
			}

			// Ensure current plan is visible
			if ( usersGridPlanFromSelectedTerm ) {
				const isCurrentPlanVisible = nextGridPlans.some(
					( plan ) =>
						getPlanClass( plan.planSlug ) === getPlanClass( usersGridPlanFromSelectedTerm.planSlug )
				);

				if ( ! isCurrentPlanVisible ) {
					nextGridPlans = [ usersGridPlanFromSelectedTerm, ...nextGridPlans ].slice(
						0,
						visibleLength
					);
				}
			}

			return nextGridPlans;
		} );
	}, [
		gridSize,
		gridPlans,
		currentSitePlanSlug,
		currentPlanTerm,
		selectedPlanTerm,
		gridPlansIndex,
	] );

	return {
		visibleGridPlans,
		setVisibleGridPlans,
	};
}
