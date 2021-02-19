/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

export default function getCredentialsAutoConfigStatus( state, siteId ) {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, 'main' ], false )
		? 'requesting'
		: 'success';
}
