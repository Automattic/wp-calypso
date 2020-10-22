/**
 * External dependencies
 */
import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import CartFreeUserPlanUpsell from 'calypso/my-sites/checkout/cart/cart-free-user-plan-upsell';
import UpcomingRenewalsReminder from 'calypso/my-sites/checkout/cart/upcoming-renewals-reminder';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type PartialCart = Pick< ResponseCart, 'products' >;
interface Props {
	responseCart: PartialCart;
	addItemToCart: () => void;
}

export interface MockResponseCart extends PartialCart {
	hasLoadedFromServer: boolean;
}

type DivProps = {
	theme?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};
const UpsellWrapper = styled.div< DivProps >`
	background: ${ ( props ) => props.theme.colors.surface };

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-top: 24px;
	}

	.cart__upsell-wrapper {
		@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			border-left: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			border-right: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		}

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		}
	}

	.cart__upsell-header {
		border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		box-shadow: none;
		margin-left: 20px;
		margin-right: 20px;
		padding-left: 0;
		padding-right: 0;

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			border-top: none;
			border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			margin-left: 0;
			margin-right: 0;
			padding-left: 20px;
			padding-right: 20px;
		}

		.section-header__label {
			color: ${ ( props ) => props.theme.colors.textColor };
			font-size: 16px;
		}
	}

	.cart__upsell-body {
		padding: 0 20px 20px;

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			padding: 20px;
		}

		p {
			margin-bottom: 1.2em;
		}
	}
`;

const SecondaryCartPromotions: FunctionComponent< Props > = ( { responseCart, addItemToCart } ) => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) as number );
	const isPurchaseRenewal = useMemo(
		() => responseCart?.products?.some?.( ( product ) => product.is_renewal ),
		[ responseCart ]
	);

	// By this point we have definitely loaded the cart using useShoppingCart
	// so we mock the loaded property the CartStore would inject.
	const mockCart = useMemo( () => ( { ...responseCart, hasLoadedFromServer: true } ), [
		responseCart,
	] );

	if (
		config.isEnabled( 'upgrades/upcoming-renewals-notices' ) &&
		isPurchaseRenewal &&
		selectedSiteId
	) {
		return (
			<UpsellWrapper>
				<UpcomingRenewalsReminder cart={ mockCart } addItemToCart={ addItemToCart } />
			</UpsellWrapper>
		);
	}

	return (
		<UpsellWrapper>
			<CartFreeUserPlanUpsell cart={ mockCart } addItemToCart={ addItemToCart } />
		</UpsellWrapper>
	);
};

export default SecondaryCartPromotions;
