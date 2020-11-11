/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/site-address-change/init';

export function getSiteAddressAvailabilityPending( state, siteId ) {
	return get( state, [ 'siteAddressChange', 'validation', siteId, 'pending' ] );
}
