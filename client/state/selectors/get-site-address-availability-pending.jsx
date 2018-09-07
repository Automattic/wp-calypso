/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

const z = 'z';

export default function( state, siteId ) {
	return get( state, [ 'siteAddressChange', 'validation', siteId, 'pending' ] );
}
