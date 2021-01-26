/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions, WPCOMFeatures, Plans } from '@automattic/data-stores';
import { Title } from '@automattic/onboarding';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import PlansTable from '../plans-table';
import PlansAccordion from '../plans-accordion';
import PlansDetails from '../plans-details';
import type {
	CTAVariation,
	CustomTagLinesMap,
	DisabledPlansMap,
	PopularBadgeVariation,
} from '../plans-table/types';
import PlansIntervalToggle from '../plans-interval-toggle';

/**
 * Style dependencies
 */
import './style.scss';

type FeatureId = WPCOMFeatures.FeatureId;

const debug = debugFactory( 'plans-grid' );

export interface Props {
	header?: React.ReactElement;
	selectedFeatures?: FeatureId[];
	currentPlanProductId: number | undefined;
	onPlanSelect: ( planProductId: number | undefined ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
	disabledPlans?: DisabledPlansMap;
	isAccordion?: boolean;
	locale: string;
	showPlanTaglines?: boolean;
	CTAVariation?: CTAVariation;
	popularBadgeVariation?: PopularBadgeVariation;
	customTagLines?: CustomTagLinesMap;
	hidePlansComparison?: boolean;
	defaultAllPlansExpanded?: boolean;
	onBillingPeriodChange?: ( billingPeriod: Plans.PlanBillingPeriod ) => void;
}

const PlansGrid: React.FunctionComponent< Props > = ( {
	header,
	selectedFeatures,
	currentPlanProductId,
	currentDomain,
	onPlanSelect,
	onPickDomainClick,
	disabledPlans,
	isAccordion,
	locale,
	showPlanTaglines = false,
	CTAVariation = 'NORMAL',
	popularBadgeVariation = 'ON_TOP',
	customTagLines,
	hidePlansComparison = false,
	defaultAllPlansExpanded = false,
	onBillingPeriodChange,
} ) => {
	const { __ } = useI18n();

	const [ billingPeriod, setBillingPeriod ] = React.useState< Plans.PlanBillingPeriod >(
		'ANNUALLY'
	);

	React.useEffect( () => {
		if ( onBillingPeriodChange ) {
			onBillingPeriodChange( billingPeriod );
		}
	}, [ billingPeriod, onBillingPeriodChange ] );

	const [ maxMonthlyDiscountPercentage, setMaxMonthlyDiscountPercentage ] = React.useState<
		number | undefined
	>( undefined );

	isAccordion && debug( 'PlansGrid accordion version is active' );

	return (
		<div className="plans-grid">
			{ header && <div className="plans-grid__header">{ header }</div> }

			<PlansIntervalToggle
				intervalType={ billingPeriod }
				onChange={ setBillingPeriod }
				maxMonthlyDiscountPercentage={ maxMonthlyDiscountPercentage }
				className="plans-grid__toggle"
			/>

			<div className="plans-grid__table">
				<div className="plans-grid__table-container">
					{ isAccordion ? (
						<PlansAccordion
							selectedFeatures={ selectedFeatures }
							selectedPlanProductId={ currentPlanProductId }
							onPlanSelect={ onPlanSelect }
							currentDomain={ currentDomain }
							onPickDomainClick={ onPickDomainClick }
							disabledPlans={ disabledPlans }
							locale={ locale }
							billingPeriod={ billingPeriod }
							onMaxMonthlyDiscountPercentageChange={ setMaxMonthlyDiscountPercentage }
						></PlansAccordion>
					) : (
						<PlansTable
							popularBadgeVariation={ popularBadgeVariation }
							CTAVariation={ CTAVariation }
							selectedPlanProductId={ currentPlanProductId }
							onPlanSelect={ onPlanSelect }
							customTagLines={ customTagLines }
							currentDomain={ currentDomain }
							onPickDomainClick={ onPickDomainClick }
							disabledPlans={ disabledPlans }
							locale={ locale }
							showTaglines={ showPlanTaglines }
							defaultAllPlansExpanded={ defaultAllPlansExpanded }
							billingPeriod={ billingPeriod }
							onMaxMonthlyDiscountPercentageChange={ setMaxMonthlyDiscountPercentage }
						></PlansTable>
					) }
				</div>
			</div>
			{ ! hidePlansComparison && (
				<div className="plans-grid__details">
					<div className="plans-grid__details-heading">
						<Title tagName="h2">{ __( 'Detailed comparison', __i18n_text_domain__ ) }</Title>
					</div>
					<div className="plans-grid__details-container">
						<PlansDetails
							onSelect={ onPlanSelect }
							locale={ locale }
							billingPeriod={ billingPeriod }
						/>
					</div>
				</div>
			) }
		</div>
	);
};

export default PlansGrid;
