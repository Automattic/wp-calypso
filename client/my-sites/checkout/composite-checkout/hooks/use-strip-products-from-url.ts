import debugFactory from 'debug';
import { useEffect } from 'react';

const debug = debugFactory( 'calypso:composite-checkout:use-strip-products-from-url' );

export default function useStripProductsFromUrl(
	siteSlug: string | undefined,
	doNotRun: boolean
): void {
	useEffect( () => {
		// Only run this when the url has been processed for products already
		if ( doNotRun ) {
			return;
		}

		try {
			// Replace the pathname with /checkout/example.com, which otherwise may
			// include new products (eg /checkout/example.com/personal) or renewals
			// (eg /checkout/value_bundle/renew/11111111/example.com). That way
			// loading the page later will not add those products to the cart again.
			// This does not strip data from the query string, including coupons.
			// Coupons are parsed out of the URL in a different place than the
			// products, and removing them here may cause them not to be applied.
			const queryString = window.location.search;
			const finalSiteSlug = siteSlug ?? 'no-site';
			const newUrl =
				window.location.protocol +
				'//' +
				window.location.host +
				'/checkout/' +
				finalSiteSlug +
				queryString +
				window.location.hash;
			debug( 'changing the url to strip the products to', newUrl );
			window.history.replaceState( null, '', newUrl );
		} catch ( error ) {
			// Fail silently; this isn't that important to do
			debug( 'changing the url to strip the products failed', error );
			return;
		}
	}, [ doNotRun, siteSlug ] );
}
