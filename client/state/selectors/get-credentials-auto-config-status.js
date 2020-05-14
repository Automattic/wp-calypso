/**
 * External Dependencies
 */
import { get } from 'lodash';

/*@__INLINE__*/
export default function getCredentialsAutoConfigStatus( state, siteId ) {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, 'main' ], false )
		? 'requesting'
		: 'success';
}
