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
	isExpandedBasketView: boolean;
	toggleExpandedBasketView: () => void;
}

const ShoppingCart = styled.div< { theme?: MarketplaceThemeType } >`
	width: 100%;
	background-color: var( --studio-gray-0 );
	padding: 15px 25px;
	max-width: 611px;
	@media ( ${ ( { theme } ) => theme.breakpoints.tabletDown } ) {
		overflow-y: scroll;
		-ms-overflow-style: none;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
		padding: 0 35px;
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
	margin-bottom: 15px;
`;

const MarketPlaceBasketItem = styled( LineItem )`
	div,
	span {
		font-size: 0.875rem;
	}
	padding: 4px 0;
`;

const MobileToggleExpandedBasket = styled.a< { theme?: MarketplaceThemeType } >`
	display: none;
	background-color: transparent;
	border-color: transparent;
	color: var( --color-accent-60 );
	margin-bottom: 20px;
	box-shadow: none;
	cursor: pointer;
	&:hover {
		color: var( --color-accent-60 );
	}

	@media ( ${ ( { theme } ) => theme.breakpoints.tabletDown } ) {
		display: block;
	}
`;

const ItemContainer = styled.div< { theme?: MarketplaceThemeType } >`
	margin: 8px 0;
`;

export default function MarketplaceShoppingCart(
	props: PropsForMarketplaceShoppingCart
): JSX.Element {
	const {
		onAddDomainToCart,
		selectedDomain,
		isExpandedBasketView,
		toggleExpandedBasketView,
	} = props;
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
			{ isExpandedBasketView ? (
				<ItemContainer>
					{ products.map( ( product ) => {
						return <MarketPlaceBasketItem key={ product.uuid } product={ product } />;
					} ) }
					{ products.map( ( product ) => {
						return <MarketPlaceBasketItem key={ product.uuid } product={ product } />;
					} ) }
				</ItemContainer>
			) : null }
			<MobileHiddenHorizontalRule />
			<ShoppingCartTotal>
				<div>{ translate( 'Total' ) }</div>
				<div>{ sub_total_display }</div>
			</ShoppingCartTotal>
			<MobileToggleExpandedBasket onClick={ toggleExpandedBasketView } isLink isPrimary>
				{ isExpandedBasketView
					? translate( 'View less details' )
					: translate( 'View more details' ) }
			</MobileToggleExpandedBasket>
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
