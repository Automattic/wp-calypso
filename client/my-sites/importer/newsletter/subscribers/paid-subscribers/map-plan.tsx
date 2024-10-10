import { formatCurrency } from '@automattic/format-currency';
import { DropdownMenu, MenuGroup, MenuItem, MenuItemsChoice, Button } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { chevronDown, Icon, arrowRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState, KeyboardEvent } from 'react';
import { Product, Plan } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';

import './map-plan.scss';

export type TierToAdd = {
	via: string;
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
	onProductSelect: ( stripeProductId: string, productId: string ) => void;
	onProductAdd: ( arg0: TierToAdd, stripeProductId: string ) => void;
	tierToAdd: TierToAdd;
	selectedProductId: string;
};

type ProductInfoProps = {
	product: Product;
};

function ProductInfo( { product }: ProductInfoProps ) {
	return (
		<>
			{ product.title && <strong>{ product.title }</strong> }
			<p>
				{ formatCurrency( parseFloat( product.price ), product.currency ) }/{ product.interval }
			</p>
		</>
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
	onProductSelect,
	onProductAdd,
	tierToAdd,
	selectedProductId,
}: MapPlanProps ) {
	const { __, _n } = useI18n();
	const [ isOpen, setIsOpen ] = useState( false );

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
					/{ plan.plan_interval }
					{ plan.active_subscriptions && (
						<>
							{ ' • ' }
							{ sprintf(
								// translators: %d is number of subscribers
								_n( '%d active subscriber', '%d active subscribers', plan.active_subscriptions ),
								plan.active_subscriptions
							) }
						</>
					) }
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
						variant="primary"
						onClick={ () => {
							onProductAdd( tierToAdd, plan.product_id );
						} }
					>
						{ __( 'Add Newsletter Tier' ) }
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
						{ selectedProduct ? (
							<ProductInfo product={ selectedProduct } />
						) : (
							__( 'Select a Newsletter Tier' )
						) }
					</Button>
					<DropdownMenu
						onToggle={ ( openState: boolean ) => {
							setIsOpen( openState );
						} }
						icon={ chevronDown }
						label={ __( 'Choose a Newsletter Tier' ) }
						open={ isOpen }
					>
						{ ( { onClose }: { onClose: () => void } ) => (
							<Fragment>
								<MenuGroup label={ __( 'Select' ) }>
									<MenuItemsChoice
										choices={ getProductChoices( sameIntervalProducts ) }
										onSelect={ ( productId ) => {
											onProductSelect( plan.product_id, productId );
											onClose();
										} }
										onHover={ () => {} }
										value={ selectedProductId }
									/>
								</MenuGroup>
								<MenuGroup label={ __( 'OR' ) }>
									<MenuItem
										key="add-new"
										onClick={ () => {
											onClose();
											onProductAdd( tierToAdd, plan.product_id );
										} }
									>
										{ __( 'Add Newsletter Tier' ) }
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
