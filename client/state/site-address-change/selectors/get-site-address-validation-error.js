/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/site-address-change/init';

export function getSiteAddressValidationError( state, siteId ) {
	return get( state, [ 'siteAddressChange', 'validation', siteId, 'error' ] );
}
