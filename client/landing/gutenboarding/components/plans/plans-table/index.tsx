/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import './style.scss';
import PlanItem from './plan-item';
import { useSelect } from '@wordpress/data';
import { STORE_KEY as PLANS_STORE } from '../../../stores/plans';

export interface Props {
	selectedPlanSlug: string;
	onPlanSelect: ( planSlug: string ) => void;
}

const Plans: React.FunctionComponent< Props > = ( { selectedPlanSlug, onPlanSelect } ) => {
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );

	return (
		<div className="plans-table">
			{ supportedPlans.map( ( plan ) => (
				<PlanItem
					key={ plan.getStoreSlug() }
					slug={ plan.getStoreSlug() }
					features={ plan.features }
					isPopular={ plan.isPopular }
					price={ plan.price }
					name={ plan.getTitle() }
					isSelected={ plan.getStoreSlug() === selectedPlanSlug }
					onSelect={ onPlanSelect }
				></PlanItem>
			) ) }
		</div>
	);
};

export default Plans;
