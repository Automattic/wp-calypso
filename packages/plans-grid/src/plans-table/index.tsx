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
import type {
	CTAVariation,
	PopularBadgeVariation,
	CustomTagLinesMap,
	DisabledPlansMap,
} from './types';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	selectedPlanProductId: number | undefined;
	onPlanSelect: ( planProductId: number | undefined ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
	disabledPlans?: DisabledPlansMap;
	locale: string;
	showTaglines?: boolean;
	CTAVariation?: CTAVariation;
	popularBadgeVariation: PopularBadgeVariation;
	customTagLines?: CustomTagLinesMap;
	defaultAllPlansExpanded?: boolean;
}

const PlansTable: React.FunctionComponent< Props > = ( {
	selectedPlanProductId,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
	disabledPlans,
	locale,
	showTaglines = false,
	CTAVariation = 'NORMAL',
	popularBadgeVariation = 'ON_TOP',
	customTagLines,
	defaultAllPlansExpanded = false,
} ) => {
	const supportedPlans = useSelect( ( select ) =>
		select( PLANS_STORE ).getSupportedPlans( locale )
	);

	const [ allPlansExpanded, setAllPlansExpanded ] = useState( defaultAllPlansExpanded );

	return (
		<div className="plans-table">
			{ supportedPlans.map(
				( plan ) =>
					plan && (
						<PlanItem
							popularBadgeVariation={ popularBadgeVariation }
							allPlansExpanded={ allPlansExpanded }
							key={ plan.periodAgnosticSlug }
							slug={ plan.periodAgnosticSlug }
							domain={ currentDomain }
							tagline={
								( showTaglines && customTagLines?.[ plan.periodAgnosticSlug ] ) ?? plan.description
							}
							CTAVariation={ CTAVariation }
							features={ plan.features ?? [] }
							isPopular={ plan.isPopular }
							isFree={ plan.isFree }
							name={ plan?.title.toString() }
							isSelected={
								!! selectedPlanProductId && plan.productIds.indexOf( selectedPlanProductId ) > -1
							}
							onSelect={ onPlanSelect }
							onPickDomainClick={ onPickDomainClick }
							onToggleExpandAll={ () => setAllPlansExpanded( ( expand ) => ! expand ) }
							disabledLabel={ disabledPlans?.[ plan.periodAgnosticSlug ] }
						></PlanItem>
					)
			) }
		</div>
	);
};

export default PlansTable;
