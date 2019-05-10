/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { getRenewalItemFromProduct } from 'lib/cart-values/cart-items';
import { addItems } from 'lib/upgrades/actions';

/**
 * Adds a purchase renewal to the cart and redirects to checkout.
 *
 * @param {Object} purchase - the purchase to be renewed
 * @param {string} siteSlug - the site slug to renew the purchase for
 */
export function handleRenewNowClick( purchase, siteSlug ) {
	const renewItem = getRenewalItemFromProduct( purchase, {
		domain: purchase.meta,
	} );
	const renewItems = [ renewItem ];

	// Track the renew now submit.
	analytics.tracks.recordEvent( 'calypso_purchases_renew_now_click', {
		product_slug: purchase.productSlug,
	} );

	addItems( renewItems );

	page( '/checkout/' + siteSlug );
}
