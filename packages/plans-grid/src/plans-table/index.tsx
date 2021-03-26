/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelect } from '@wordpress/data';

import type { DomainSuggestions, Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import PlanItem from './plan-item';
import { useSupportedPlans } from '../hooks';
import { PLANS_STORE } from '../stores';

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
	billingPeriod: Plans.PlanBillingPeriod;
}

const PlansTable: React.FunctionComponent< Props > = ( {
	selectedPlanProductId,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
	disabledPlans,
	locale,
	billingPeriod,
	showTaglines = false,
	CTAVariation = 'NORMAL',
	popularBadgeVariation = 'ON_TOP',
	customTagLines,
	defaultAllPlansExpanded = false,
} ) => {
	const { supportedPlans } = useSupportedPlans( locale, billingPeriod );

	const [ allPlansExpanded, setAllPlansExpanded ] = useState( defaultAllPlansExpanded );

	const getPlanProduct = useSelect( ( select ) => select( PLANS_STORE ).getPlanProduct );

	return (
		<div className="plans-table">
			{ supportedPlans
				.filter( ( plan ) => !! plan )
				.map( ( plan ) => (
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
						billingPeriod={ billingPeriod }
						isPopular={ plan.isPopular }
						isFree={ plan.isFree }
						name={ plan?.title.toString() }
						isSelected={
							!! selectedPlanProductId &&
							selectedPlanProductId ===
								getPlanProduct( plan.periodAgnosticSlug, billingPeriod )?.productId
						}
						onSelect={ onPlanSelect }
						onPickDomainClick={ onPickDomainClick }
						onToggleExpandAll={ () => setAllPlansExpanded( ( expand ) => ! expand ) }
						disabledLabel={ disabledPlans?.[ plan.periodAgnosticSlug ] }
					></PlanItem>
				) ) }
		</div>
	);
};

export default PlansTable;
