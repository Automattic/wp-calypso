/**
 * External dependencies
 */
import { useEffect } from 'react';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:composite-checkout:use-strip-products-from-url' );

export default function useStripProductsFromUrl(
	siteSlug: string | undefined,
	isLoading: boolean
): void {
	useEffect( () => {
		// Only run this when the url has been processed already
		if ( ! isLoading ) {
			return;
		}

		try {
			// Replace the pathname with /checkout/example.com, which otherwise may
			// include new products (eg /checkout/example.com/personal) or renewals
			// (eg /checkout/value_bundle/renew/11111111/example.com) or coupons (eg
			// /checkout/example.com?coupon=FOOBAR). That way loading the page later
			// will not add those products to the cart again.
			const queryString = window.location.search;
			const alteredQueryString = queryString.replace( /&?coupon=[^&]+&?/, '' );
			const newUrl =
				window.location.protocol + '//' + window.location.host + '/checkout/' + siteSlug ??
				'no-site' + alteredQueryString + window.location.hash;
			debug( 'changing the url to strip the products to', newUrl );
			window.history.replaceState( null, '', newUrl );
		} catch ( error ) {
			// Fail silently; this isn't that important to do
			debug( 'changing the url to strip the products failed', error );
			return;
		}
	}, [ isLoading, siteSlug ] );
}
