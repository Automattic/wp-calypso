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
	selectedPlanSlug: Plans.PlanSlug;
	onPlanSelect: ( planSlug: string ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
	disabledPlans?: { [ planSlug: string ]: string };
	locale: string;
}

const PlansTable: React.FunctionComponent< Props > = ( {
	selectedFeatures = [],
	selectedPlanSlug,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
	disabledPlans,
	locale,
} ) => {
	const { __ } = useI18n();

	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices( locale ) );

	const isLoading = ! supportedPlans?.length;
	const placeholderPlans = [ 1, 2, 3, 4 ];

	// Primary plan
	const popularPlan = useSelect( ( select ) => select( PLANS_STORE ).getDefaultPaidPlan( locale ) );
	const recommendedPlanSlug = useSelect( ( select ) =>
		select( WPCOM_FEATURES_STORE ).getRecommendedPlanSlug( selectedFeatures )
	);

	const recommendedPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanBySlug( recommendedPlanSlug )
	);
	const primaryPlan = recommendedPlan || popularPlan;
	const badge = recommendedPlan
		? __( 'Recommended for you', __i18n_text_domain__ )
		: __( 'Popular', __i18n_text_domain__ );

	// Other plans
	const otherPlans = supportedPlans.filter( ( plan ) => plan.storeSlug !== primaryPlan.storeSlug );

	// Handle toggling of all plan items
	const defaultOpenPlans = [ primaryPlan?.storeSlug ];
	const [ openPlans, setOpenPlans ] = useState( defaultOpenPlans );
	const allPlansOpened = isLoading ? false : openPlans.length >= supportedPlans.length;

	const handleToggle = ( slug: string, isOpen: boolean ) => {
		setOpenPlans( isOpen ? [ ...openPlans, slug ] : openPlans.filter( ( s ) => s !== slug ) );
	};

	const handleToggleAll = () => {
		setOpenPlans(
			allPlansOpened ? defaultOpenPlans : supportedPlans.map( ( plan ) => plan.storeSlug )
		);
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
								key={ primaryPlan.storeSlug }
								slug={ primaryPlan.storeSlug }
								name={ primaryPlan?.title.toString() }
								description={ primaryPlan?.description.toString() }
								features={ primaryPlan.features ?? [] }
								price={ prices[ primaryPlan.storeSlug ] }
								domain={ currentDomain }
								badge={ badge }
								isFree={ primaryPlan.isFree }
								isOpen
								isPrimary
								isSelected={ primaryPlan.storeSlug === selectedPlanSlug }
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
								key={ plan.storeSlug }
								slug={ plan.storeSlug }
								name={ plan?.title.toString() }
								description={ plan?.description.toString() }
								features={ plan.features ?? [] }
								price={ prices[ plan.storeSlug ] }
								domain={ currentDomain }
								isFree={ plan.isFree }
								isOpen={
									openPlans.indexOf( plan.storeSlug ) > -1 && ! disabledPlans?.[ plan.storeSlug ]
								}
								isSelected={ plan.storeSlug === selectedPlanSlug }
								onSelect={ onPlanSelect }
								onPickDomainClick={ onPickDomainClick }
								onToggle={ handleToggle }
								disabledLabel={ disabledPlans?.[ plan.storeSlug ] }
							></PlanItem>
					  ) ) }
			</div>
		</div>
	);
};

export default PlansTable;
