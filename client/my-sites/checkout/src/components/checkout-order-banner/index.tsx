import { useShoppingCart } from '@automattic/shopping-cart';
import { useSelector } from 'react-redux';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { GiftingCheckoutBanner } from 'calypso/my-sites/checkout/src/components/checkout-order-banner/gifting-checkout-banner';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';

export function CheckoutOrderBanner() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const giftSiteSlug = responseCart.gift_details?.receiver_blog_slug ?? '';
	const receiverBlogId = responseCart.gift_details?.receiver_blog_id ?? 0;

	const path = window.location.pathname;

	const receiverSiteSettings = useSelector( ( state: object ) =>
		receiverBlogId ? getSiteSettings( state, receiverBlogId ) : null
	);

	// Check the path instead of using responseCart.is_gift_purchase because it visually loads the banner faster.
	if ( ! ( path.startsWith( '/checkout/' ) && path.includes( '/gift/' ) ) ) {
		return null;
	}

	// Suppress the banner if the receiver site is flagged for content.
	if ( receiverSiteSettings?.flag ) {
		return null;
	}

	return (
		<>
			{ receiverBlogId > 0 && <QuerySiteSettings siteId={ receiverBlogId } /> }
			<GiftingCheckoutBanner siteSlug={ giftSiteSlug } />
		</>
	);
}
