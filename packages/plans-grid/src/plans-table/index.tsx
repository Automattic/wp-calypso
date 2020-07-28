/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions } from '@automattic/data-stores';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import PlanItem from '../plan-item';
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
	const { __ } = useI18n();

	const supportedPlans = useSelect( ( select ) => select( PLANS_STORE ).getSupportedPlans() );
	const prices = useSelect( ( select ) => select( PLANS_STORE ).getPrices() );

	// Primary plan
	// TODO: Feature picker determines recommended plan depending on the features that user choose.
	const recommendedPlanSlug = null;
	const popularPlanSlug = 'value_bundle';
	const primaryPlanSlug = recommendedPlanSlug || popularPlanSlug;
	const primaryPlan = supportedPlans.find( ( plan ) => plan.storeSlug === primaryPlanSlug );
	const badge = recommendedPlanSlug ? __( 'Recommended for you' ) : __( 'Popular' );

	// Other plans
	const otherPlans = supportedPlans.filter( ( plan ) => plan.storeSlug !== primaryPlanSlug );

	// Handle toggling of all plan items
	const defaultOpenPlans = [ primaryPlanSlug ];
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
		<div className="plans-table">
			<div className="plans-table__plan-item-group">
				{ primaryPlan && (
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
				) }
			</div>

			<div className="plans-table__actions">
				<Button className="plans-table__toggle-all-button" onClick={ handleToggleAll } isLink>
					{ allPlansOpened ? __( 'Collapse all plans' ) : __( 'Show all plans' ) }
				</Button>
			</div>

			<div className="plans-table__plan-item-group">
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
						isOpen={ openPlans.indexOf( plan.storeSlug ) > -1 }
						isSelected={ plan.storeSlug === selectedPlanSlug }
						onSelect={ onPlanSelect }
						onPickDomainClick={ onPickDomainClick }
						onToggle={ handleToggle }
					></PlanItem>
				) ) }
			</div>
		</div>
	);
};

export default PlansTable;
