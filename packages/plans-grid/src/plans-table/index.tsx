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
	disabledPlans?: { [ planSlug: string ]: string };
	locale: string;
}

const PlansTable: React.FunctionComponent< Props > = ( {
	selectedPlanSlug,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
	disabledPlans,
	locale,
} ) => {
	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices( locale ) );
	const [ allPlansExpanded, setAllPlansExpanded ] = useState( false );

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
							onToggleExpandAll={ () => setAllPlansExpanded( ( expand ) => ! expand ) }
							disabledLabel={ disabledPlans?.[ plan.storeSlug ] }
						></PlanItem>
					)
			) }
		</div>
	);
};

export default PlansTable;
