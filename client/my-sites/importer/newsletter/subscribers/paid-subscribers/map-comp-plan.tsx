import { formatCurrency } from '@automattic/number-formatters';
import { DropdownMenu, MenuGroup, MenuItemsChoice, Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { chevronDown, Icon, arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { Product } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

import './map-plan.scss';

type MapCompPlanProps = {
	compCount: number;
	tiers: Product[];
	selectedTierId: string;
	onCompPlanSelect: ( tierId: string ) => void;
};

function formatTierPrice( tier: Product ) {
	return `${ formatCurrency( parseFloat( tier.price ), tier.currency ) }/${ tier.interval }`;
}

function displayTier( tier?: Product, fallback?: string ) {
	if ( ! tier ) {
		return fallback;
	}

	return (
		<span>
			<strong>{ tier.title }</strong> <span>{ formatTierPrice( tier ) }</span>
		</span>
	);
}

export function MapCompPlan( {
	compCount,
	tiers,
	selectedTierId,
	onCompPlanSelect,
}: MapCompPlanProps ) {
	const { __, _n } = useI18n();
	const [ isOpen, setIsOpen ] = useState( false );

	const selectedTier = tiers.find( ( tier ) => tier.id.toString() === selectedTierId );

	const choices = tiers.map( ( tier ) => ( {
		info: formatTierPrice( tier ),
		label: tier.title,
		value: tier.id.toString(),
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
					{ displayTier( selectedTier, __( 'Select a tier' ) ) }
				</Button>
				<DropdownMenu
					onToggle={ ( openState: boolean ) => setIsOpen( openState ) }
					icon={ chevronDown }
					label={ __( 'Choose a tier for comped subscribers' ) }
					open={ isOpen }
				>
					{ ( { onClose }: { onClose: () => void } ) => (
						<MenuGroup label={ __( 'Grant complimentary access to' ) }>
							<MenuItemsChoice
								choices={ choices }
								onSelect={ ( tierId ) => {
									onCompPlanSelect( tierId );
									onClose();
								} }
								onHover={ () => {} }
								value={ selectedTierId }
							/>
						</MenuGroup>
					) }
				</DropdownMenu>
			</div>
		</div>
	);
}
