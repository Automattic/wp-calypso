/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelect } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import PlanItem from './plan-item';
import { PLANS_STORE } from '../constants';

/**
 * Style dependencies
 */
import './style.scss';

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
	const [ allPlansExpanded, setAllPlansExpanded ] = useState( false );

	// Easier to hardcode 'premium' than to access data stores
	const defaultExpandedPlans = [ 'premium' ];
	const [ expandedPlans, setExpandedPlans ] = useState( defaultExpandedPlans );

	// When user manually opens all the plans, this ensure "Show all plans" button
	// is automatically switched into "Collapse all plans" button.
	const handleToggle = ( slug: string, isExpanded: boolean ) => {
		const updatedExpandedPlans = isExpanded
			? [ ...expandedPlans, slug ]
			: expandedPlans.filter( ( s ) => s !== slug );
		setExpandedPlans( updatedExpandedPlans );
		setAllPlansExpanded( updatedExpandedPlans.length >= supportedPlans.length );
	};

	const handleToggleExpandAll = () => {
		allPlansExpanded && setExpandedPlans( defaultExpandedPlans );
		setAllPlansExpanded( ! allPlansExpanded );
	};

	return (
		<div className="plans-table">
			{ supportedPlans.map(
				( plan ) =>
					plan && (
						<PlanItem
							allPlansExpanded={ allPlansExpanded }
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
							onToggle={ handleToggle }
							onToggleExpandAll={ handleToggleExpandAll }
						></PlanItem>
					)
			) }
		</div>
	);
};

export default PlansTable;
