/**
 * Internal dependencies
 */
import { TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE } from 'calypso/state/action-types';

import 'calypso/state/login/init';

export function updateNonce( nonceType, twoStepNonce ) {
	return {
		type: TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
		nonceType,
		twoStepNonce,
	};
}
