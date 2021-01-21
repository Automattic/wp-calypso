/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions, Plans, WPCOMFeatures } from '@automattic/data-stores';
import { Button, SVG, Path } from '@wordpress/components';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import PlanItem from '../plans-accordion-item';
import PlanItemPlaceholder from '../plans-accordion-item/plans-item-placeholder';
import { PLANS_STORE, WPCOM_FEATURES_STORE } from '../constants';
import type { DisabledPlansMap } from 'src/plans-table/types';

/**
 * Style dependencies
 */
import './style.scss';

type FeatureId = WPCOMFeatures.FeatureId;

const tip = (
	<SVG viewBox="0 0 24 24">
		<Path d="M12 15.8c-3.7 0-6.8-3-6.8-6.8s3-6.8 6.8-6.8c3.7 0 6.8 3 6.8 6.8s-3.1 6.8-6.8 6.8zm0-12C9.1 3.8 6.8 6.1 6.8 9s2.4 5.2 5.2 5.2c2.9 0 5.2-2.4 5.2-5.2S14.9 3.8 12 3.8zM8 17.5h8V19H8zM10 20.5h4V22h-4z" />
	</SVG>
);

export interface Props {
	selectedFeatures?: FeatureId[];
	selectedPlanProductId: number | undefined;
	onPlanSelect: ( planProductId: number | undefined ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
	disabledPlans?: DisabledPlansMap;
	locale: string;
	billingPeriod: Plans.PlanBillingPeriod;
	onMaxMonhtlyDiscountPercentageChange: ( perc: number | undefined ) => void;
}

const PlansTable: React.FunctionComponent< Props > = ( {
	selectedFeatures = [],
	selectedPlanProductId,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
	disabledPlans,
	locale,
	billingPeriod,
	onMaxMonhtlyDiscountPercentageChange,
} ) => {
	const { __ } = useI18n();

	const supportedPlans = useSelect( ( select ) =>
		select( PLANS_STORE ).getSupportedPlans( locale )
	);

	React.useEffect( () => {
		// Get all products, calculate max perc
		onMaxMonhtlyDiscountPercentageChange( 43 );
	}, [ onMaxMonhtlyDiscountPercentageChange, supportedPlans ] );

	const isLoading = ! supportedPlans?.length;
	const placeholderPlans = [ 1, 2, 3, 4 ];

	// Primary plan
	const popularPlan = useSelect( ( select ) => select( PLANS_STORE ).getDefaultPaidPlan( locale ) );
	const recommendedPlanSlug = useSelect( ( select ) =>
		select( WPCOM_FEATURES_STORE ).getRecommendedPlanSlug( selectedFeatures )
	);

	const recommendedPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanByPeriodAgnosticSlug( recommendedPlanSlug )
	);

	const primaryPlan = recommendedPlan || popularPlan;

	const badge = recommendedPlan
		? __( 'Recommended for you', __i18n_text_domain__ )
		: __( 'Popular', __i18n_text_domain__ );

	// Other plans
	const otherPlans = supportedPlans.filter(
		( plan ) => plan.periodAgnosticSlug !== primaryPlan?.periodAgnosticSlug
	);

	// Handle toggling of all plan items
	const defaultOpenPlans = [ primaryPlan?.periodAgnosticSlug ];
	const [ openPlans, setOpenPlans ] = useState( defaultOpenPlans );
	const allPlansOpened = isLoading ? false : openPlans.length >= supportedPlans.length;

	const handleToggle = ( slug: Plans.PlanSlug, isOpen: boolean ) => {
		setOpenPlans( isOpen ? [ ...openPlans, slug ] : openPlans.filter( ( s ) => s !== slug ) );
	};

	const handleToggleAll = () => {
		setOpenPlans(
			allPlansOpened ? defaultOpenPlans : supportedPlans.map( ( plan ) => plan.periodAgnosticSlug )
		);
	};

	const onAnnualDiscountChange = ( plan: Plans.Plan, discount: number | undefined ) => {
		console.log( plan, discount );
	};

	return (
		<div className="plans-accordion">
			<div className="plans-accordion__plan-item-group">
				{ isLoading ? (
					<PlanItemPlaceholder isOpen isPrimary></PlanItemPlaceholder>
				) : (
					primaryPlan && (
						<>
							{ recommendedPlan && (
								<div className="plans-accordion__recommend-hint">
									<Icon icon={ tip } size={ 16 } />
									<span>
										{
											// translators: tooltip explaining why a particular plan has been recommended
											__( 'Based on the features you selected.', __i18n_text_domain__ )
										}
									</span>
								</div>
							) }
							<PlanItem
								key={ primaryPlan.periodAgnosticSlug }
								slug={ primaryPlan.periodAgnosticSlug }
								name={ primaryPlan?.title.toString() }
								description={ primaryPlan?.description.toString() }
								features={ primaryPlan.features ?? [] }
								billingPeriod={ billingPeriod }
								domain={ currentDomain }
								badge={ badge }
								isFree={ primaryPlan.isFree }
								isOpen
								isPrimary
								isSelected={
									!! selectedPlanProductId &&
									primaryPlan.productIds.indexOf( selectedPlanProductId ) > -1
								}
								onSelect={ onPlanSelect }
								onPickDomainClick={ onPickDomainClick }
							></PlanItem>
						</>
					)
				) }
			</div>

			<div className="plans-accordion__actions">
				<Button className="plans-accordion__toggle-all-button" onClick={ handleToggleAll } isLink>
					{ allPlansOpened
						? __( 'Collapse all plans', __i18n_text_domain__ )
						: __( 'Show all plans', __i18n_text_domain__ ) }
				</Button>
			</div>

			<div className="plans-accordion__plan-item-group">
				{ isLoading
					? placeholderPlans.map( ( placeholder ) => (
							<PlanItemPlaceholder key={ placeholder }></PlanItemPlaceholder>
					  ) )
					: otherPlans.map( ( plan ) => (
							<PlanItem
								key={ plan.periodAgnosticSlug }
								slug={ plan.periodAgnosticSlug }
								name={ plan?.title.toString() }
								description={ plan?.description.toString() }
								features={ plan.features ?? [] }
								billingPeriod={ billingPeriod }
								domain={ currentDomain }
								isFree={ plan.isFree }
								isOpen={
									openPlans.indexOf( plan.periodAgnosticSlug ) > -1 &&
									! disabledPlans?.[ plan.periodAgnosticSlug ]
								}
								isSelected={ plan.productIds.indexOf( selectedPlanProductId as never ) > -1 }
								onSelect={ onPlanSelect }
								onPickDomainClick={ onPickDomainClick }
								onToggle={ handleToggle }
								disabledLabel={ disabledPlans?.[ plan.periodAgnosticSlug ] }
							></PlanItem>
					  ) ) }
			</div>
		</div>
	);
};

export default PlansTable;
