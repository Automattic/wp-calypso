/**
 * Internal dependencies
 */
import 'calypso/state/site-address-change/init';

export function getSiteAddressAvailabilityPending( state, siteId ) {
	return state.siteAddressChange.validation[ siteId ]?.pending;
}
