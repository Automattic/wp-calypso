/**
 * External dependencies
 */
import { get } from 'lodash';

export default function ( state, siteId ) {
	return get( state, [ 'siteAddressChange', 'validation', siteId, 'pending' ] );
}
