/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import type { Plans, DomainSuggestions, WPCOMFeatures } from '@automattic/data-stores';
import { Title } from '@automattic/onboarding';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import PlansTable from '../plans-table';
import PlansAccordion from '../plans-accordion';
import PlansDetails from '../plans-details';
import PlansIntervalToggle, { BillingIntervalType } from '../plans-interval-toggle';
import type { CTAVariation, CustomTagLinesMap, PopularBadgeVariation } from '../plans-table/types';

/**
 * Style dependencies
 */
import './style.scss';

type PlansSlug = Plans.PlanSlug;
type FeatureId = WPCOMFeatures.FeatureId;

const debug = debugFactory( 'plans-grid' );

export interface Props {
	header?: React.ReactElement;
	selectedFeatures?: FeatureId[];
	currentPlan?: Plans.Plan;
	onPlanSelect: ( plan: PlansSlug ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
	disabledPlans?: { [ planSlug: string ]: string };
	isAccordion?: boolean;
	locale: string;
	showPlanTaglines?: boolean;
	CTAVariation?: CTAVariation;
	popularBadgeVariation?: PopularBadgeVariation;
	customTagLines?: CustomTagLinesMap;
	hidePlansComparison?: boolean;
	defaultAllPlansExpanded?: boolean;
}

const PlansGrid: React.FunctionComponent< Props > = ( {
	header,
	selectedFeatures,
	currentPlan,
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
} ) => {
	const { __ } = useI18n();

	isAccordion && debug( 'PlansGrid accordion version is active' );

	const [ billingInterval, setBillingInterval ] = React.useState< BillingIntervalType >( 'yearly' );

	return (
		<div className="plans-grid">
			{ header && <div className="plans-grid__header">{ header }</div> }

			<PlansIntervalToggle
				intervalType={ billingInterval }
				onChange={ ( selectedInterval ) => {
					setBillingInterval( selectedInterval );
					console.log( `Toggle updated! New value: ${ selectedInterval }` );
				} }
				maxSavingsPerc={ 14 }
			/>

			<div className="plans-grid__table">
				<div className="plans-grid__table-container">
					{ isAccordion ? (
						<PlansAccordion
							selectedFeatures={ selectedFeatures }
							selectedPlanSlug={ currentPlan?.storeSlug ?? '' }
							onPlanSelect={ onPlanSelect }
							currentDomain={ currentDomain }
							onPickDomainClick={ onPickDomainClick }
							disabledPlans={ disabledPlans }
							locale={ locale }
						></PlansAccordion>
					) : (
						<PlansTable
							popularBadgeVariation={ popularBadgeVariation }
							CTAVariation={ CTAVariation }
							selectedPlanSlug={ currentPlan?.storeSlug ?? '' }
							onPlanSelect={ onPlanSelect }
							customTagLines={ customTagLines }
							currentDomain={ currentDomain }
							onPickDomainClick={ onPickDomainClick }
							disabledPlans={ disabledPlans }
							locale={ locale }
							showTaglines={ showPlanTaglines }
							defaultAllPlansExpanded={ defaultAllPlansExpanded }
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
						<PlansDetails onSelect={ onPlanSelect } locale={ locale } />
					</div>
				</div>
			) }
		</div>
	);
};

export default PlansGrid;
