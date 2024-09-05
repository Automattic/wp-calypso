import { formatCurrency } from '@automattic/format-currency';
import { DropdownMenu, MenuGroup, MenuItem, MenuItemsChoice, Button } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { chevronDown, Icon, arrowRight } from '@wordpress/icons';
import { useState, KeyboardEvent } from 'react';
import { useMapStripePlanToProductMutation } from 'calypso/data/paid-newsletter/use-map-stripe-plan-to-product-mutation';
import { Product, Plan } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

import './map-plan.scss';

export type TierToAdd = {
	currency: string;
	price: number;
	type: string;
	title: string;
	interval: string;
	annualProduct: {
		currency: string;
		price: number;
		type: string;
		interval: string;
	};
};

type MapPlanProps = {
	plan: Plan;
	products: Product[];
	map_plans: any;
	siteId: number;
	engine: string;
	currentStep: string;
	onProductAdd: ( arg0: TierToAdd | null ) => void;
	tierToAdd: TierToAdd;
};

function displayProduct( product?: Product ) {
	if ( ! product ) {
		return 'Select a Newsletter Tier';
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

function getProductChoices( products: Product[] ) {
	return products.map( ( product ) => ( {
		info: `${ formatCurrency( parseFloat( product.price ), product.currency ) } / ${
			product.interval
		}`,
		label: product.title,
		value: product.id.toString(),
	} ) );
}

export function MapPlan( {
	plan,
	products,
	map_plans,
	siteId,
	engine,
	currentStep,
	onProductAdd,
	tierToAdd,
}: MapPlanProps ) {
	const { mapStripePlanToProduct } = useMapStripePlanToProductMutation();
	let active_subscriptions = '';
	if ( plan.active_subscriptions ) {
		active_subscriptions = ` • ${ plan.active_subscriptions } active subscribers`;
	}

	const mappedProductId =
		( map_plans.hasOwnProperty( plan.product_id ) && map_plans[ plan.product_id ] ) ?? '';

	const [ selectedProductId, setSelectedProductId ] = useState( mappedProductId );
	const [ isOpen, setIsOpen ] = useState( false );

	const handleProductChange = ( productId: string ) => {
		setSelectedProductId( productId );
		mapStripePlanToProduct( siteId, engine, currentStep, plan.product_id, productId );
	};

	const selectedProduct = products.find(
		( product ) => product.id.toString() === selectedProductId
	);

	const sameIntervalProducts = products.filter( ( product ) => {
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
			{ ! products.length && (
				<div className="map-plan__select-product">
					<Button
						aria-haspopup="true"
						tabIndex={ 0 }
						className="map-plan__selected"
						onClick={ () => {
							onProductAdd( tierToAdd );
						} }
					>
						Add Newsletter Tier
					</Button>
				</div>
			) }
			{ !! products.length && (
				<div className="map-plan__select-product">
					<Button
						aria-haspopup="true"
						tabIndex={ 0 }
						className="map-plan__selected"
						onClick={ () => {
							setIsOpen( ! isOpen );
						} }
						onKeyDown={ ( event: KeyboardEvent ) => {
							if ( event.key === 'Enter' || event.key === ' ' ) {
								setIsOpen( ! isOpen );
							}
						} }
					>
						{ displayProduct( selectedProduct ) }
					</Button>
					<DropdownMenu
						onToggle={ ( openState: boolean ) => {
							setIsOpen( openState );
						} }
						icon={ chevronDown }
						label="Choose a Newsletter Tier"
						open={ isOpen }
					>
						{ ( { onClose }: { onClose: () => void } ) => (
							<Fragment>
								<MenuGroup label="Select">
									<MenuItemsChoice
										choices={ getProductChoices( sameIntervalProducts ) }
										onSelect={ ( productId ) => {
											handleProductChange( productId );
											onClose();
										} }
										onHover={ () => {} }
										value={ selectedProductId.toString() }
									/>
								</MenuGroup>
								<MenuGroup label="OR">
									<MenuItem
										key="add-new"
										onClick={ () => {
											onClose();
											onProductAdd( tierToAdd );
										} }
									>
										Add Newsletter Tier
									</MenuItem>
								</MenuGroup>
							</Fragment>
						) }
					</DropdownMenu>
				</div>
			) }
		</div>
	);
}
