/**
 * Internal dependencies
 */
import 'calypso/state/site-address-change/init';

export function isSiteAddressValidationAvailable( state, siteId ) {
	return state.siteAddressChange.validation[ siteId ]?.isAvailable;
}
