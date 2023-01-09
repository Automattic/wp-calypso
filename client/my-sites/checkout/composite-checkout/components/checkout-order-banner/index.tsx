import { useShoppingCart } from '@automattic/shopping-cart';
import * as React from 'react';
import { GiftingCheckoutBanner } from 'calypso/my-sites/checkout/composite-checkout/components/checkout-order-banner/gifting-checkout-banner';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';

export function CheckoutOrderBanner() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const giftSiteSlug = responseCart.gift_details?.receiver_blog_slug;

	if ( responseCart.is_gift_purchase && giftSiteSlug ) {
		return <GiftingCheckoutBanner siteSlug={ giftSiteSlug } />;
	}
	return null;
}
