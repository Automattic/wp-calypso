/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_DISMISS_URL_STATUS } from 'calypso/state/jetpack-connect/action-types';

import 'calypso/state/jetpack-connect/init';

export function dismissUrl( url ) {
	return {
		type: JETPACK_CONNECT_DISMISS_URL_STATUS,
		url,
	};
}
