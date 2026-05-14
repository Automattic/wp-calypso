import { useShoppingCart } from '@automattic/shopping-cart';
import { GiftingCheckoutBanner } from 'calypso/my-sites/checkout/src/components/checkout-order-banner/gifting-checkout-banner';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';

export function CheckoutOrderBanner() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const giftSiteSlug = responseCart.gift_details?.receiver_blog_slug ?? '';
	const isContentFlagged = responseCart.gift_details?.is_content_flagged ?? false;

	const path = window.location.pathname;

	// Check the path instead of using responseCart.is_gift_purchase because it visually loads the banner faster.
	// Suppress the banner when the recipient site has been flagged for content policy violations.
	if ( path.startsWith( '/checkout/' ) && path.includes( '/gift/' ) && ! isContentFlagged ) {
		return <GiftingCheckoutBanner siteSlug={ giftSiteSlug } />;
	}
	return null;
}
