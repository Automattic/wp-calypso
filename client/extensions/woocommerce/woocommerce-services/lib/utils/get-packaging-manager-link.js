/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';

/**
 * Given the site, returns url of the Packaging Manager
 *
 * @param {object} site - site
 * @returns {string} - url of the packaging manager page
 */
export default ( site ) => {
	return getLink( '/store/settings/shipping/:site/', site );
};
