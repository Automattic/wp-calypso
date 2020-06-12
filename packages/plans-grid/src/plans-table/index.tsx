/**
 * External dependencies
 */
import React from 'react';
import { useSelect } from '@wordpress/data';
import { Plans, DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import PlanItem from './plan-item';

/**
 * Style dependencies
 */
import './style.scss';

const PLANS_STORE = Plans.register();

export interface Props {
	selectedPlanSlug: string;
	onPlanSelect: ( planSlug: string ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
}

const PlansTable: React.FunctionComponent< Props > = ( {
	selectedPlanSlug,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
} ) => {
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
							domain={ currentDomain }
							features={ plan.features ?? [] }
							isPopular={ plan.isPopular }
							isFree={ plan.isFree }
							price={ prices[ plan.storeSlug ] }
							name={ plan?.title.toString() }
							isSelected={ plan.storeSlug === selectedPlanSlug }
							onSelect={ onPlanSelect }
							onPickDomainClick={ onPickDomainClick }
						></PlanItem>
					)
			) }
		</div>
	);
};

export default PlansTable;
