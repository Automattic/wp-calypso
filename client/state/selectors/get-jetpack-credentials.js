/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack/init';

export default function getJetpackCredentials( state, siteId, role ) {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, role ], {} );
}
