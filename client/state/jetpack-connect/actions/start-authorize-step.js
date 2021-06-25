/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_QUERY_SET } from 'calypso/state/jetpack-connect/action-types';

import 'calypso/state/jetpack-connect/init';

export function startAuthorizeStep( clientId ) {
	return {
		type: JETPACK_CONNECT_QUERY_SET,
		clientId,
		timestamp: Date.now(),
	};
}
