/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';

/**
 * Given the product id and site, returns url of the product edit page
 * @param {String} productId - product id
 * @param {Object} site - site
 * @returns {String} - url of the product edit page
 */
export default ( productId, site ) => {
	return getLink( '/store/product/:site/' + productId, site );
};
