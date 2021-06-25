/**
 * External dependencies
 */
import React from 'react';
import { useShoppingCart } from '@automattic/shopping-cart';
import type { ResponseCartProduct } from '@automattic/shopping-cart';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { keyframes } from '@emotion/core';

/**
 * Internal dependencies
 */
import { LineItem } from 'calypso/my-sites/checkout/composite-checkout/components/wp-order-review-line-items';
import type { MarketplaceThemeProps } from 'calypso/my-sites/plugins/marketplace/theme';
import {
	MobileHiddenHorizontalRule,
	FullWidthButton,
} from 'calypso/my-sites/plugins/marketplace/components';

interface PropsForMarketplaceShoppingCart {
	onCheckout: () => void;
	selectedDomainProductUUID: string;
	isExpandedBasketView: boolean;
	toggleExpandedBasketView: () => void;
}

const ShoppingCart = styled.div< MarketplaceThemeProps >`
	width: 100%;
	background-color: ${ ( { theme } ) => theme?.colors.studioGrey };
	padding: 15px 25px;
	max-width: 611px;
	display: inline-table;
	@media ( ${ ( { theme } ) => theme?.breakpoints.tabletDown } ) {
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

const MobileTotal = styled.div< MarketplaceThemeProps >`
	display: none;
	@media ( ${ ( { theme } ) => theme?.breakpoints.tabletDown } ) {
		display: block;
	}
`;

const ShoppingCartTotal = styled.div< MarketplaceThemeProps >`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 20px;
	div {
		font-size: 1.15rem;
		font-weight: ${ ( { theme } ) => theme?.weights.bold };
		font-weight: 600;
	}

	@media ( ${ ( { theme } ) => theme?.breakpoints.tabletDown } ) {
		display: none;
	}
`;

const MarketPlaceBasketItem = styled( LineItem )`
	div,
	span {
		font-size: 0.875rem;
	}
	padding: 4px 0;
`;

const MobileToggleExpandedBasket = styled.a< MarketplaceThemeProps >`
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

	@media ( ${ ( { theme } ) => theme?.breakpoints.tabletDown } ) {
		display: block;
	}
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }

  70% {
  	opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
`;

const SideBarLoadingCopy = styled.p`
	font-size: 14px;
	height: 31px;
	width: 100%;
	content: '';
	background: var( --studio-gray-5 );
	margin: 15px 0 0 0;
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;
`;

const StyledBasketItemContainer = styled( BasketItemContainer )`
	margin: 8px 0;
	min-height: 30px;
`;

function BasketItemContainer( {
	products,
	isLoading,
	isExpandedBasketView,
}: {
	products: Array< ResponseCartProduct >;
	isLoading: boolean;
	isExpandedBasketView: boolean;
} ) {
	if ( isLoading ) {
		return (
			<div>
				<SideBarLoadingCopy />
				<SideBarLoadingCopy />
			</div>
		);
	}
	return isExpandedBasketView ? (
		<div>
			{ products.map( ( product: ResponseCartProduct ) => (
				<MarketPlaceBasketItem key={ product.uuid } product={ product } />
			) ) }
		</div>
	) : null;
}

export default function MarketplaceShoppingCart(
	props: PropsForMarketplaceShoppingCart
): JSX.Element {
	const {
		onCheckout,
		selectedDomainProductUUID,
		isExpandedBasketView,
		toggleExpandedBasketView,
	} = props;
	const { responseCart, isLoading, isPendingUpdate } = useShoppingCart();
	const { products, sub_total_display } = responseCart;
	const isBasketLoading = isLoading || isPendingUpdate;
	const translate = useTranslate();
	return (
		<ShoppingCart className="marketplace-shopping-cart__root">
			<ShoppingCartTitle>
				<h1>{ translate( 'Your cart' ) } </h1>
				{ isBasketLoading ? null : <MobileTotal>{ sub_total_display }</MobileTotal> }
			</ShoppingCartTitle>
			<StyledBasketItemContainer
				isLoading={ isBasketLoading }
				isExpandedBasketView={ isExpandedBasketView }
				products={ products }
			/>

			<MobileHiddenHorizontalRule />

			<ShoppingCartTotal>
				{ isBasketLoading ? (
					<SideBarLoadingCopy />
				) : (
					<>
						<div>{ translate( 'Total' ) }</div>
						<div>{ sub_total_display }</div>
					</>
				) }
			</ShoppingCartTotal>
			<MobileToggleExpandedBasket onClick={ toggleExpandedBasketView }>
				{ isExpandedBasketView
					? translate( 'View less details' )
					: translate( 'View more details' ) }
			</MobileToggleExpandedBasket>
			<FullWidthButton
				onClick={ onCheckout }
				busy={ isLoading || isPendingUpdate }
				primary
				disabled={ selectedDomainProductUUID === null }
			>
				{ translate( 'Checkout' ) }
			</FullWidthButton>
		</ShoppingCart>
	);
}
