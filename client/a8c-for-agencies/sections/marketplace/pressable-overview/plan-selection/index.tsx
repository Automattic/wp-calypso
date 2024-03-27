import { useCallback, useEffect, useState } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import PlanSelectionFilter from './filter';

import './style.scss';

export default function PressableOverviewPlanSelection() {
	const [ selectedPlan, setSelectedPlan ] = useState< APIProductFamilyProduct | null >( null );

	const onSelectPlan = useCallback(
		( plan: APIProductFamilyProduct | null ) => {
			setSelectedPlan( plan );
		},
		[ setSelectedPlan ]
	);

	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	useEffect( () => {
		if ( pressablePlans?.length ) {
			setSelectedPlan( pressablePlans[ 0 ] );
		}
	}, [ pressablePlans, setSelectedPlan ] );

	return (
		<div className="pressable-overview-plan-selection">
			<PlanSelectionFilter
				selectedPlan={ selectedPlan }
				plans={ pressablePlans }
				onSelectPlan={ onSelectPlan }
			/>
		</div>
	);
}
