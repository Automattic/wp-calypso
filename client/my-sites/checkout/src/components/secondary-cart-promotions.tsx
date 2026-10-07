import config from '@automattic/calypso-config';
import { styled } from '@automattic/wpcom-checkout';
import { FunctionComponent } from 'react';
import { withoutHttp } from 'calypso/lib/url';
import CartFreeUserPlanUpsell from 'calypso/my-sites/checkout/cart/cart-free-user-plan-upsell';
import UpcomingRenewalsReminder from 'calypso/my-sites/checkout/cart/upcoming-renewals-reminder';
import { useCheckoutSite } from 'calypso/my-sites/checkout/src/hooks/use-checkout-site';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseCart, MinimalRequestCartProduct } from '@automattic/shopping-cart';

export type PartialCart = Partial< ResponseCart > & Pick< ResponseCart, 'products' >;
interface Props {
	responseCart: PartialCart;
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
	isCartPendingUpdate?: boolean;
	isPurchaseRenewal?: boolean;
}

const UpsellWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };

	.cart__upsell-wrapper {
		@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
			border-left: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			border-right: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		}

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			margin-top: 0;
		}
	}

	.cart__upsell-header {
		border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		box-shadow: none;
		padding-left: 24px;
		padding-right: 24px;

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			border-top: none;
			border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		}

		.section-header__label {
			color: ${ ( props ) => props.theme.colors.textColor };
			font-size: 14px;
			font-weight: 600;
		}
	}

	.cart__upsell-body {
		padding: 0 24px 24px;
		font-size: 14px;

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			padding: 16px 24px 24px;
		}

		p {
			margin-bottom: 1.2em;
			word-break: break-word;
		}
	}
`;

const SecondaryCartPromotions: FunctionComponent< Props > = ( {
	responseCart,
	addItemToCart,
	isPurchaseRenewal,
} ) => {
	const selectedSite = useSelector( getSelectedSite );
	// "Renew now" checkouts have no selected site, so fall back to the one the server assigned to the cart.
	const { data: cartSite } = useCheckoutSite(
		selectedSite ? null : Number( responseCart.blog_id ) || 0
	);
	const site =
		selectedSite ??
		( cartSite && { ID: cartSite.ID, slug: cartSite.slug, domain: withoutHttp( cartSite.URL ) } );

	if ( config.isEnabled( 'upgrades/upcoming-renewals-notices' ) && isPurchaseRenewal && site ) {
		return (
			<UpsellWrapper>
				<UpcomingRenewalsReminder
					cart={ responseCart }
					addItemToCart={ addItemToCart }
					site={ site }
				/>
			</UpsellWrapper>
		);
	}

	return (
		<UpsellWrapper>
			<CartFreeUserPlanUpsell addItemToCart={ addItemToCart } />
		</UpsellWrapper>
	);
};

export default SecondaryCartPromotions;
