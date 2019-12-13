/**
 * External Dependencies
 */
import { get } from 'lodash';

export default function getJetpackCredentials( state, siteId, role ) {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, role ], {} );
}
