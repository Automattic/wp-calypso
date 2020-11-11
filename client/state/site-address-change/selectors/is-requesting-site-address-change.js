/**
 * Internal dependencies
 */
import 'calypso/state/site-address-change/init';

/**
 * @param {object} state Global app state
 * @param {number} siteId - site ID
 * @returns {boolean} Signals whether or not there is currently a request in progress for the given siteId
 */
export function isRequestingSiteAddressChange( state, siteId ) {
	return state.siteAddressChange.requesting[ siteId ] ?? null;
}
