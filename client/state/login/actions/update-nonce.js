/**
 * Internal dependencies
 */
import { TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE } from 'state/action-types';

import 'state/login/init';

export function updateNonce( nonceType, twoStepNonce ) {
	return {
		type: TWO_FACTOR_AUTHENTICATION_UPDATE_NONCE,
		nonceType,
		twoStepNonce,
	};
}
