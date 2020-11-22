/**
 * Internal dependencies
 */
import 'calypso/state/site-address-change/init';

export function getSiteAddressValidationError( state, siteId ) {
	return state.siteAddressChange.validation[ siteId ]?.error;
}
