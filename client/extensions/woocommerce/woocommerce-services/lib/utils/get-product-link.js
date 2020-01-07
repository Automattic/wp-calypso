/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';

/**
 * Given the product id and site, returns url of the product edit page
 * @param {string} productId - product id
 * @param {object} site - site
 * @returns {string} - url of the product edit page
 */
export default ( productId, site ) => {
	return getLink( '/store/product/:site/' + productId, site );
};
