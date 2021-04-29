/**
 * External dependencies
 */
import React from 'react';
import { useShoppingCart } from '@automattic/shopping-cart';
import { HorizontalRule, Button } from '@wordpress/components';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { LineItem } from 'calypso/my-sites/checkout/composite-checkout/components/wp-order-review-line-items';
import { DomainSuggestions } from 'calypso/../packages/data-stores/src';
import { MarketplaceThemeType } from 'calypso/my-sites/plugins/marketplace';

interface PropsForMarketplaceShoppingCart {
	onAddDomainToCart: () => void;
	selectedDomain: DomainSuggestions.DomainSuggestion;
}

const MarketplaceTitle = styled.h1`
	font-size: 1.5em;
`;

const ShoppingCartTotal = styled.div< { theme?: MarketplaceThemeType } >`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 20px;
	div {
		font-size: 1.15rem;
		font-weight: ${ ( { theme } ) => theme.weights.bold };
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
		<>
			<MarketplaceTitle>Your cart</MarketplaceTitle>
			<div>
				{ products.map( ( product ) => {
					return <LineItem key={ product.uuid } product={ product } />;
				} ) }
			</div>
			<HorizontalRule />
			<ShoppingCartTotal>
				<div> Total </div>
				<div>{ sub_total_display }</div>
			</ShoppingCartTotal>

			<FullWidthButton
				onClick={ onAddDomainToCart }
				isBusy={ false }
				isPrimary
				disabled={ selectedDomain === null }
			>
				Checkout
			</FullWidthButton>
		</>
	);
}
