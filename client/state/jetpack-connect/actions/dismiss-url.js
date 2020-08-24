/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_DISMISS_URL_STATUS } from 'state/jetpack-connect/action-types';

import 'state/jetpack-connect/init';

export function dismissUrl( url ) {
	return {
		type: JETPACK_CONNECT_DISMISS_URL_STATUS,
		url,
	};
}
