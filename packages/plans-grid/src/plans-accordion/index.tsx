/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions, Plans } from '@automattic/data-stores';
import { Button, SVG, Path } from '@wordpress/components';
import { Icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import PlanItem from '../plans-accordion-item';
import { PLANS_STORE } from '../constants';

/**
 * Style dependencies
 */
import './style.scss';

const tip = (
	<SVG viewBox="0 0 24 24">
		<Path d="M12 15.8c-3.7 0-6.8-3-6.8-6.8s3-6.8 6.8-6.8c3.7 0 6.8 3 6.8 6.8s-3.1 6.8-6.8 6.8zm0-12C9.1 3.8 6.8 6.1 6.8 9s2.4 5.2 5.2 5.2c2.9 0 5.2-2.4 5.2-5.2S14.9 3.8 12 3.8zM8 17.5h8V19H8zM10 20.5h4V22h-4z" />
	</SVG>
);

export interface Props {
	recommendedPlanSlug?: Plans.PlanSlug;
	selectedPlanSlug: Plans.PlanSlug;
	onPlanSelect: ( planSlug: string ) => void;
	onPickDomainClick?: () => void;
	currentDomain?: DomainSuggestions.DomainSuggestion;
	disabledPlans?: { [ planSlug: string ]: string };
}

const PlansTable: React.FunctionComponent< Props > = ( {
	recommendedPlanSlug,
	selectedPlanSlug,
	onPlanSelect,
	onPickDomainClick,
	currentDomain,
	disabledPlans,
} ) => {
	const { __ } = useI18n();

	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices() );

	// Primary plan
	const popularPlan = useSelect( ( select ) => select( PLANS_STORE ).getDefaultPaidPlan() );
	const recommendedPlan = useSelect( ( select ) =>
		recommendedPlanSlug ? select( PLANS_STORE ).getPlanBySlug( recommendedPlanSlug ) : undefined
	);
	const primaryPlan = recommendedPlan || popularPlan;
	const badge = recommendedPlan ? __( 'Recommended for you' ) : __( 'Popular' );

	// Other plans
	const otherPlans = supportedPlans.filter( ( plan ) => plan.storeSlug !== primaryPlan.storeSlug );

	// Handle toggling of all plan items
	const defaultOpenPlans = [ primaryPlan.storeSlug ];
	const [ openPlans, setOpenPlans ] = useState( defaultOpenPlans );
	const allPlansOpened = openPlans.length >= supportedPlans.length;

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
				{ primaryPlan && (
					<>
						{ recommendedPlan && (
							<div className="plans-accordion__recommend-hint">
								<Icon icon={ tip } size={ 16 } />
								<span>{ __( 'Based on the features you selected.' ) }</span>
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
				) }
			</div>

			<div className="plans-accordion__actions">
				<Button className="plans-accordion__toggle-all-button" onClick={ handleToggleAll } isLink>
					{ allPlansOpened ? __( 'Collapse all plans' ) : __( 'Show all plans' ) }
				</Button>
			</div>

			<div className="plans-accordion__plan-item-group">
				{ otherPlans.map( ( plan ) => (
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
