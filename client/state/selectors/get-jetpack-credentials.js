/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function getJetpackCredentials( state, siteId, role ) {
	const scanCredentials = get( state, [ 'jetpackScan', 'scan', siteId, 'credentials' ], false );
	if ( scanCredentials ) {
		return scanCredentials.filter( ( credential ) => credential.role === role );
	}
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, role ], {} );
}
