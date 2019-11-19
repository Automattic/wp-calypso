/**
 * Internal dependencies
 */
import { isEnabled } from 'config';

/**
 * Retrieve the "intent" that the client implied prior to upgrading so we can send them to the appropriate route after checkout
 *
 * @param {object} state  Global state tree
 * @returns {string} The intent signaled by the customer for upgrade purposes
 */
export default function getCheckoutUpgradeIntent( state ) {
	// This is gated by a config flag while we wait for translations
	return ( isEnabled( 'checkout-upgrade-intent' ) && state?.ui?.checkout?.upgradeIntent ) || '';
}
