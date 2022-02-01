import { untrailingslashit } from 'calypso/lib/route';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function getDomainOrProductFromContext( { params, store }: PageJS.Context ): string {
	const { domainOrProduct, product } = params;
	const state = store.getState();
	const selectedSite = getSelectedSite( state );

	let result;

	if ( selectedSite?.slug !== domainOrProduct && domainOrProduct ) {
		result = domainOrProduct;
	} else {
		result = product;
	}

	return result || '';
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
