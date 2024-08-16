import { formatCurrency } from '@automattic/format-currency';
import { DropdownMenu, MenuGroup, MenuItem, MenuItemsChoice, Button } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { chevronDown, Icon, arrowRight } from '@wordpress/icons';
import { useState } from 'react';
import { useMapStripePlanToProductMutation } from 'calypso/data/paid-newsletter/use-map-stripe-plan-to-product-mutation';

import './map-plan.scss';

type Plan = {
	plan_id: string;
	name: string;
	plan_interval: string;
	active_subscriptions: number;
	is_active: boolean;
	plan_currency: string;
	plan_amount_decimal: number;
	product_id: string;
};

type Product = {
	id: number;
	price: string;
	currency: string;
	title: string;
	interval: string;
};

type MapPlanProps = {
	plan: Plan;
	products: Array< Product >;
	map_plans: any;
	siteId: string;
	engine: string;
	currentStep: string;
};

function displayProduct( productId: string, products: Array< Product > ) {
	if ( ! productId ) {
		return 'Select a Newsletter Tier';
	}

	const product = products.find( ( product: Product ) => product.id.toString() === productId );
	if ( ! product ) {
		return '';
	}
	return (
		<div>
			<strong>{ product.title || '' }</strong>
			<p>
				{ formatCurrency( parseFloat( product.price ), product.currency ) }/{ product.interval }
			</p>
		</div>
	);
}

function getProductChoices( products: Array< Product > ) {
	return products.map( ( product ) => ( {
		info: `${ formatCurrency( parseFloat( product.price ), product.currency ) } / ${
			product.interval
		}`,
		label: product.title,
		value: product.id.toString(),
	} ) );
}

export default function MapPlan( {
	plan,
	products,
	map_plans,
	siteId,
	engine,
	currentStep,
}: MapPlanProps ) {
	const { mapStripePlanToProduct } = useMapStripePlanToProductMutation();
	let active_subscriptions = '';
	if ( plan.active_subscriptions ) {
		active_subscriptions = ` • ${ plan.active_subscriptions } active subscribers`;
	}

	const mappedProduct =
		( map_plans.hasOwnProperty( plan.product_id ) && map_plans[ plan.product_id ] ) ?? '';

	const [ selectedProduct, setSelectedProduct ] = useState( mappedProduct );
	const [ isOpen, setIsOpen ] = useState( false );

	const handleProductChange = ( productId: string, onClose ) => {
		setSelectedProduct( productId );
		mapStripePlanToProduct( siteId, engine, currentStep, plan.product_id, productId );
		onClose();
	};

	const specificProducts = products.filter( ( product ) => {
		return product.interval === plan.plan_interval;
	} );

	return (
		<div className="map-plan">
			<div className="map-plan__info">
				<strong>{ plan.name }</strong>
				<p>
					{ formatCurrency( plan.plan_amount_decimal, plan.plan_currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ) }
					/{ plan.plan_interval } { active_subscriptions }
				</p>
			</div>
			<div className="map-plan__arrow">
				<Icon icon={ arrowRight } />
			</div>
			<div className="map-plan__select-product">
				<Button
					aria-haspopup="true"
					tabIndex={ 0 }
					className="map-plan__selected"
					onClick={ () => {
						setIsOpen( ! isOpen );
					} }
					onKeyDown={ ( event ) => {
						if ( event.key === 'Enter' || event.key === ' ' ) {
							setIsOpen( ! isOpen );
						}
					} }
				>
					{ displayProduct( selectedProduct, products ) }
				</Button>
				<DropdownMenu
					onToggle={ ( openState: boolean ) => {
						setIsOpen( openState );
					} }
					icon={ chevronDown }
					label="Choose a Newsletter Tier"
					open={ isOpen }
				>
					{ ( { onClose } ) => (
						<Fragment>
							<MenuGroup label="Newsletter Tiers">
								<MenuItemsChoice
									choices={ getProductChoices( specificProducts ) }
									onSelect={ ( productId ) => {
										handleProductChange( productId, onClose );
									} }
									onHover={ () => {} }
									value={ selectedProduct.toString() }
								/>
							</MenuGroup>
							<MenuGroup label="OR">
								<MenuItem key="add-new" onClick={ onClose }>
									Add Newsletter Tier
								</MenuItem>
							</MenuGroup>
						</Fragment>
					) }
				</DropdownMenu>
			</div>
		</div>
	);
}
