/**
 * External dependencies
 */
import React from 'react';
import { Plans as PlansStore } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import './style.scss';
import PlanItem from './plan-item';
import { useSelect } from '@wordpress/data';

export interface Props {
	selectedPlanSlug: string;
	onPlanSelect: ( planSlug: string ) => void;
}

const PLANS_STORE = PlansStore.STORE_KEY;

const Plans: React.FunctionComponent< Props > = ( { selectedPlanSlug, onPlanSelect } ) => {
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices() );

	return (
		<div className="plans-table">
			{ supportedPlans.map(
				( plan ) =>
					plan && (
						<PlanItem
							key={ plan.storeSlug }
							slug={ plan.storeSlug }
							features={ plan.features ?? [] }
							isPopular={ plan.isPopular }
							isFree={ plan.isFree }
							price={ prices[ plan.storeSlug ] }
							name={ plan?.title.toString() }
							isSelected={ plan.storeSlug === selectedPlanSlug }
							onSelect={ onPlanSelect }
						></PlanItem>
					)
			) }
		</div>
	);
};

export default Plans;
