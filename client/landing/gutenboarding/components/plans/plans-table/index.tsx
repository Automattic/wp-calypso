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
import { PLAN_FREE, PLAN_PREMIUM } from '../../../stores/plans/constants';

export interface Props {
	selectedPlanSlug: string;
	onPlanSelect: ( planSlug: string ) => void;
}

const Plans: React.FunctionComponent< Props > = ( { selectedPlanSlug, onPlanSelect } ) => {
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices() );
	const allFeatures = useSelect( ( select ) => select( PLANS_STORE ).getAllFeatures() );

	return (
		<div className="plans-table">
			{ Object.entries( supportedPlans ).map( ( [ slug, plan ] ) => (
				<PlanItem
					key={ slug }
					slug={ slug }
					features={ plan.features.map(
						( featureKey ) => allFeatures.find( ( { id } ) => id === featureKey )?.name ?? ''
					) }
					isPopular={ slug === PLAN_PREMIUM }
					isFree={ slug === PLAN_FREE }
					price={ prices[ slug ] }
					name={ plan.short_name }
					isSelected={ slug === selectedPlanSlug }
					onSelect={ onPlanSelect }
				></PlanItem>
			) ) }
		</div>
	);
};

export default Plans;
