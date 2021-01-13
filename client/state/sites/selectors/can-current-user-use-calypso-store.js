/**
 * Internal dependencies
 */
import config from 'calypso/config';
import canCurrentUserUseAnyWooCommerceBasedStore from 'calypso/state/sites/selectors/can-current-user-use-any-woocommerce-based-store';

/**
 * Returns true if current user can see and use the Calypso-based Store option in menu
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether current user can use the Calypso-based Store
 */
export default function canCurrentUserUseCalypsoStore( state, siteId = null ) {
	if (
		config.isEnabled( 'woocommerce/store-removed' ) ||
		! config.isEnabled( 'woocommerce/extension-dashboard' )
	) {
		return false;
	}

	return canCurrentUserUseAnyWooCommerceBasedStore( state, siteId );
}
