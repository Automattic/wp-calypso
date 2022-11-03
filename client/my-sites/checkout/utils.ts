import { untrailingslashit } from 'calypso/lib/route';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Return the product slug or product alias from a checkout route.
 *
 * Checkout routes support including a product slug (eg: `value_bundle`) or
 * alias (eg: `premium`) in the URL. The most common checkout route uses the
 * format `/checkout/:site/:product`, but it also supports the path
 * `/checkout/:product/:site`.
 *
 * Checkout also supports routes that only include one or the other, using the
 * formats `/checkout/:product` and `/checkout/:site`.
 *
 * This function tries to determine which part of the path is the product, if
 * any, and return it. It will return an empty string if no product is found.
 *
 * Some examples of valid paths:
 *
 * 1. `/checkout/example.com` (path contains a domain)
 * 2. `/checkout/no-adverts%25no-adverts.php` (path contains a product)
 * 3. `/checkout/domain-mapping:example.com` (path contains a product)
 * 4. `/checkout/example.com::blog` (path contains a domain)
 * 5. `/checkout/example.com::blog/pro` (path contains a domain followed by a product)
 * 6. `/checkout/pro/example.com::blog` (path contains a product followed by a domain)
 */
export function getProductSlugFromContext(
	context: PageJS.Context,
	options?: { isJetpackCheckout?: boolean }
): string | undefined {
	const { params, store, pathname } = context;
	const {
		domainOrProduct,
		product,
		productSlug,
	}: {
		domainOrProduct: string | undefined;
		product: string | undefined;
		productSlug: string | undefined;
	} = params;
	const state = store.getState();
	const selectedSite = getSelectedSite( state );
	const isGiftPurchase = pathname.includes( '/gift/' );

	if ( options?.isJetpackCheckout ) {
		return productSlug;
	}

	if ( isGiftPurchase ) {
		return domainOrProduct || product;
	}

	if ( ! domainOrProduct && ! product ) {
		return '';
	}

	// If one matches the selected site, return the other.
	if ( domainOrProduct && selectedSite?.slug && selectedSite.slug === domainOrProduct ) {
		return product || '';
	}

	if ( product && selectedSite?.slug && selectedSite.slug === product ) {
		return domainOrProduct || '';
	}

	// If there is no selected site, there will never be a `product`, and the
	// `domainOrProduct` must be a product slug because a domain would have
	// selected a site.
	if ( ! selectedSite?.slug ) {
		return domainOrProduct || '';
	}

	// If one string is a valid URL, and there is another, use the other one.
	if ( domainOrProduct ) {
		const isDomain = doesStringResembleDomain( domainOrProduct );
		if ( isDomain && product ) {
			return product;
		}
		if ( ! isDomain ) {
			return domainOrProduct;
		}
	}

	if ( product ) {
		const isDomain = doesStringResembleDomain( product );
		if ( isDomain && domainOrProduct ) {
			return domainOrProduct;
		}
		if ( ! isDomain ) {
			return product;
		}
	}

	return '';
}

function doesStringResembleDomain( domainOrProduct: string ): boolean {
	try {
		// Domain names should all contain a dot.
		const hasDot = domainOrProduct.includes( '.' );
		if ( ! hasDot ) {
			return false;
		}

		// Subdomain site slugs contain the install path after two colons.
		const domainBeforeColons = domainOrProduct.split( '::' )[ 0 ];

		// Domains should be able to become a valid URL.
		// eslint-disable-next-line no-new
		new URL( 'http://' + domainBeforeColons );
		return true;
	} catch {}
	return false;
}

/**
 * Prepends "http(s)" to user-supplied URL if protocol is missing.
 *
 * @param {string} inputUrl User-supplied URL
 * @param {?boolean} httpsIsDefault Default to 'https' if true vs 'http' if false
 * @returns {string} URL string with http(s) included
 */
export function addHttpIfMissing( inputUrl: string, httpsIsDefault = true ): string {
	const scheme = httpsIsDefault ? 'https' : 'http';
	let url = inputUrl.trim().toLowerCase();

	if ( url && url.substr( 0, 4 ) !== 'http' ) {
		url = `${ scheme }://` + url;
	}
	return untrailingslashit( url );
}
