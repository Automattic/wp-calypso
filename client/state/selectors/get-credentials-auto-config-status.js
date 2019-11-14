/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function getCredentialsAutoConfigStatus( state, siteId ) {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, 'main' ], false )
		? 'requesting'
		: 'success';
}
