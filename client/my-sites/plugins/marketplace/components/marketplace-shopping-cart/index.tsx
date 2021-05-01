/**
 * External dependencies
 */
import React from 'react';
import { useShoppingCart } from '@automattic/shopping-cart';
import { Button } from '@wordpress/components';
import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { LineItem } from 'calypso/my-sites/checkout/composite-checkout/components/wp-order-review-line-items';
import { DomainSuggestions } from 'calypso/../packages/data-stores/src';
import { MarketplaceThemeType } from 'calypso/my-sites/plugins/marketplace';
import { MobileHiddenHorizontalRule } from 'calypso/my-sites/plugins/marketplace/components';

interface PropsForMarketplaceShoppingCart {
	onAddDomainToCart: () => void;
	selectedDomain: DomainSuggestions.DomainSuggestion | null;
}

const ShoppingCart = styled.div< { theme?: MarketplaceThemeType } >`
	width: 100%;
	background-color: var( --studio-gray-0 );
	padding: 15px 25px;
	height: 275px;

	@media ( ${ ( { theme } ) => theme.breakpoints.tabletDown } ) {
		position: fixed;
		bottom: 0;
		height: auto;
		max-height: 226px;
		overflow-y: scroll;
		-ms-overflow-style: none;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}
`;

const ShoppingCartTitle = styled.div`
	font-size: 1.25em;
	display: flex;
	justify-content: space-between;
`;

const MobileTotal = styled.div< { theme?: MarketplaceThemeType } >`
	display: none;
	@media ( ${ ( { theme } ) => theme.breakpoints.tabletDown } ) {
		display: block;
	}
`;

const ShoppingCartTotal = styled.div< { theme?: MarketplaceThemeType } >`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 20px;
	div {
		font-size: 1.15rem;
		font-weight: ${ ( { theme } ) => theme.weights.bold };
		font-weight: 600;
	}

	@media ( ${ ( { theme } ) => theme.breakpoints.tabletDown } ) {
		display: none;
	}
`;

const FullWidthButton = styled( Button )`
	justify-content: center;
	width: 100%;
`;

export default function MarketplaceShoppingCart(
	props: PropsForMarketplaceShoppingCart
): JSX.Element {
	const { onAddDomainToCart, selectedDomain } = props;
	const { responseCart, isLoading } = useShoppingCart();
	const { products, sub_total_display } = responseCart;

	return isLoading ? (
		<></>
	) : (
		<ShoppingCart className="marketplace-shopping-cart__root">
			<ShoppingCartTitle>
				<h1>{ translate( 'Your cart' ) } </h1>
				<MobileTotal>{ sub_total_display }</MobileTotal>
			</ShoppingCartTitle>

			<div>
				{ products.map( ( product ) => {
					return <LineItem key={ product.uuid } product={ product } />;
				} ) }
			</div>
			<MobileHiddenHorizontalRule />
			<ShoppingCartTotal>
				<div>{ translate( 'Total' ) }</div>
				<div>{ sub_total_display }</div>
			</ShoppingCartTotal>

			<FullWidthButton
				onClick={ onAddDomainToCart }
				isBusy={ false }
				isPrimary
				disabled={ selectedDomain === null }
			>
				{ translate( 'Checkout' ) }
			</FullWidthButton>
		</ShoppingCart>
	);
}
