/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

/**
 * Retrieve the "intent" that the client implied prior to upgrading so we can send them to the appropriate route after checkout
 *
 * @param {object} state  Global state tree
 * @returns {string} The intent signaled by the customer for upgrade purposes
 */
export default function getCheckoutUpgradeIntent( state ) {
	return state?.ui?.checkout?.upgradeIntent || '';
}
