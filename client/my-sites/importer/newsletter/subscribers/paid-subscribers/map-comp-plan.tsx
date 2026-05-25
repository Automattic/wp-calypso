import { formatCurrency } from '@automattic/number-formatters';
import { DropdownMenu, MenuGroup, MenuItemsChoice, Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { chevronDown, Icon, arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { Plan } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

type MapCompPlanProps = {
	compCount: number;
	plans: Plan[];
	selectedStripePlanId: string;
	onCompPlanSelect: ( stripePlanId: string ) => void;
};

function displayPlan( plan?: Plan, fallback?: string ) {
	if ( ! plan ) {
		return fallback;
	}

	return (
		<span>
			<strong>{ plan.name }</strong>{ ' ' }
			<span>
				{ formatCurrency( plan.plan_amount_decimal, plan.plan_currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
				/{ plan.plan_interval }
			</span>
		</span>
	);
}

export function MapCompPlan( {
	compCount,
	plans,
	selectedStripePlanId,
	onCompPlanSelect,
}: MapCompPlanProps ) {
	const { __, _n } = useI18n();
	const [ isOpen, setIsOpen ] = useState( false );

	const selectedPlan = plans.find( ( plan ) => plan.product_id === selectedStripePlanId );

	const choices = plans.map( ( plan ) => ( {
		info: `${ formatCurrency( plan.plan_amount_decimal, plan.plan_currency, {
			isSmallestUnit: true,
			stripZeros: true,
		} ) } / ${ plan.plan_interval }`,
		label: plan.name,
		value: plan.product_id,
	} ) );

	return (
		<div className="map-plan">
			<div className="map-plan__info">
				<strong>{ __( 'Comped subscribers' ) }</strong>
				<p>
					{ sprintf(
						// Translators: %d is number of complimentary subscribers
						_n( '%d complimentary subscriber', '%d complimentary subscribers', compCount ),
						compCount
					) }
				</p>
			</div>
			<div className="map-plan__arrow">
				<Icon icon={ arrowRight } />
			</div>
			<div className="map-plan__select-product">
				<Button
					aria-haspopup="true"
					className="map-plan__selected"
					onClick={ () => setIsOpen( ! isOpen ) }
				>
					{ displayPlan( selectedPlan, __( 'Select a plan' ) ) }
				</Button>
				<DropdownMenu
					onToggle={ ( openState: boolean ) => setIsOpen( openState ) }
					icon={ chevronDown }
					label={ __( 'Choose a plan for comped subscribers' ) }
					open={ isOpen }
				>
					{ ( { onClose }: { onClose: () => void } ) => (
						<MenuGroup label={ __( 'Grant complimentary access to' ) }>
							<MenuItemsChoice
								choices={ choices }
								onSelect={ ( stripePlanId ) => {
									onCompPlanSelect( stripePlanId );
									onClose();
								} }
								onHover={ () => {} }
								value={ selectedStripePlanId }
							/>
						</MenuGroup>
					) }
				</DropdownMenu>
			</div>
		</div>
	);
}
