/**
 * Internal dependencies
 */
import { JETPACK_CONNECT_CONFIRM_JETPACK_STATUS } from 'state/jetpack-connect/action-types';

import 'state/jetpack-connect/init';

export function confirmJetpackInstallStatus( status ) {
	return {
		type: JETPACK_CONNECT_CONFIRM_JETPACK_STATUS,
		status,
	};
}
