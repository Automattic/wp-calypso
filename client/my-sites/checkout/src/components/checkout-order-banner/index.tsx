import { useShoppingCart } from '@automattic/shopping-cart';
import { GiftingCheckoutBanner } from 'calypso/my-sites/checkout/src/components/checkout-order-banner/gifting-checkout-banner';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';

export function CheckoutOrderBanner() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const giftSiteSlug = responseCart.gift_details?.receiver_blog_slug ?? '';

	const path = window.location.pathname;

	// Check the path instead of using responseCart.is_gift_purchase because it visually loads the banner faster.
	if ( path.startsWith( '/checkout/' ) && path.includes( '/gift/' ) ) {
		return <GiftingCheckoutBanner siteSlug={ giftSiteSlug } />;
	}
	return null;
}
