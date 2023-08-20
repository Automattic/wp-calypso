import config from '@automattic/calypso-config';
import { isPro, isStarter } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { FunctionComponent, useMemo } from 'react';
import CartFreeUserPlanUpsell from 'calypso/my-sites/checkout/cart/cart-free-user-plan-upsell';
import UpcomingRenewalsReminder from 'calypso/my-sites/checkout/cart/upcoming-renewals-reminder';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ResponseCart, MinimalRequestCartProduct } from '@automattic/shopping-cart';

export type PartialCart = Partial< ResponseCart > & Pick< ResponseCart, 'products' >;
interface Props {
	responseCart: PartialCart;
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
	isCartPendingUpdate?: boolean;
}

type DivProps = {
	theme?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const UpsellWrapper = styled.div< DivProps >`
	background: ${ ( props ) => props.theme.colors.surface };

	.cart__upsell-wrapper {
		@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			border-left: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			border-right: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		}

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			margin-top: 24px;
		}
	}

	.cart__upsell-header {
		border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		box-shadow: none;
		padding-left: 20px;
		padding-right: 20px;

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			border-top: none;
			border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			padding-left: 24px;
			padding-right: 24px;
		}

		.section-header__label {
			color: ${ ( props ) => props.theme.colors.textColor };
			font-size: 14px;
			font-weight: 600;
		}
	}

	.cart__upsell-body {
		padding: 0 20px 20px;
		font-size: 14px;

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			padding: 16px 24px 24px;
		}

		p {
			margin-bottom: 1.2em;
		}
	}
`;

const SecondaryCartPromotions: FunctionComponent< Props > = ( {
	responseCart,
	addItemToCart,
	isCartPendingUpdate,
} ) => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) as number );
	const isPurchaseRenewal = useMemo(
		() => responseCart?.products?.some?.( ( product ) => product.is_renewal ),
		[ responseCart ]
	);

	if (
		config.isEnabled( 'upgrades/upcoming-renewals-notices' ) &&
		isPurchaseRenewal &&
		selectedSiteId
	) {
		return (
			<UpsellWrapper>
				<UpcomingRenewalsReminder cart={ responseCart } addItemToCart={ addItemToCart } />
			</UpsellWrapper>
		);
	}

	const isStarterPlan = responseCart.products.some( ( product ) => {
		return isStarter( product );
	} );

	const isProPlan = responseCart.products.some( ( product ) => {
		return isPro( product );
	} );

	if ( ! isStarterPlan && ! isProPlan ) {
		return (
			<UpsellWrapper>
				<CartFreeUserPlanUpsell
					cart={ responseCart }
					addItemToCart={ addItemToCart }
					isCartPendingUpdate={ isCartPendingUpdate }
				/>
			</UpsellWrapper>
		);
	}

	return null;
};

export default SecondaryCartPromotions;
