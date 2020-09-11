/**
 * Internal dependencies
 */
import user from 'lib/user';
import { ACCOUNT_CLOSE, ACCOUNT_CLOSE_SUCCESS } from 'state/action-types';

import 'state/data-layer/wpcom/me/account/close';
import 'state/account/init';

export function closeAccount() {
	return {
		type: ACCOUNT_CLOSE,
	};
}

export function closeAccountSuccess() {
	return async ( dispatch ) => {
		await user().clear();
		dispatch( {
			type: ACCOUNT_CLOSE_SUCCESS,
		} );
	};
}
