/**
 * External dependencies
 */
import React, { useState } from 'react';
import type { DomainSuggestions, Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import PlanItem from './plan-item';
import type {
	CTAVariation,
	PopularBadgeVariation,
	CustomTagLinesMap,
	DisabledPlansMap,
} from './types';
import { useSupportedPlans } from '../hooks';

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
	onMaxMonthlyDiscountPercentageChange: ( perc: number | undefined ) => void;
}

const PlansTable: React.FunctionComponent< Props > = ( {
	selectedPlanProductId,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
	disabledPlans,
	locale,
	billingPeriod,
	onMaxMonthlyDiscountPercentageChange,
	showTaglines = false,
	CTAVariation = 'NORMAL',
	popularBadgeVariation = 'ON_TOP',
	customTagLines,
	defaultAllPlansExpanded = false,
} ) => {
	const { supportedPlans, maxAnnualDiscount } = useSupportedPlans( locale, billingPeriod );

	React.useEffect( () => {
		onMaxMonthlyDiscountPercentageChange( maxAnnualDiscount );
	}, [ onMaxMonthlyDiscountPercentageChange, maxAnnualDiscount ] );

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
							billingPeriod={ billingPeriod }
							isPopular={ plan.isPopular }
							isFree={ plan.isFree }
							name={ plan?.title.toString() }
							isSelected={ plan.productIds.indexOf( selectedPlanProductId as never ) > -1 }
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
