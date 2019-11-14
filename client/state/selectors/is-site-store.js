/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isJetpackSite } from 'state/sites/selectors';
/**
 * Returns true if site is Jetpack and has WooCommerce plugin set to active. Otherwise false
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is an Jetpack and has WooCommerce active
 */
export default function isSiteStore( state, siteId ) {
	return (
		isJetpackSite( state, siteId ) &&
		get( state, [ 'sites', 'items', siteId, 'options', 'woocommerce_is_active' ], null )
	);
}
