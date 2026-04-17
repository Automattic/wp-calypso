import { find, get } from 'lodash';

/**
 * Checks whether the given domain product requires HSTS (HTTP Strict Transport Security).
 * HSTS is mandatory for certain TLDs (e.g. .app, .dev, .page) that are preloaded in
 * browsers' HSTS lists, meaning those domains can only be served over HTTPS.
 * @param {string} productSlug - the product slug identifying the domain type
 * @param {Array} productsList - list of product objects from the API
 * @returns {boolean} - true if the TLD mandates HSTS
 */
export function isHstsRequired( productSlug, productsList ) {
	const product = find( productsList, [ 'product_slug', productSlug ] ) || {};

	return get( product, 'is_hsts_required', false );
}
