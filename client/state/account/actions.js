/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE, ACCOUNT_CLOSE_SUCCESS } from 'calypso/state/action-types';
import { clearStore } from 'calypso/lib/user/store';

import 'calypso/state/data-layer/wpcom/me/account/close';
import 'calypso/state/account/init';

export function closeAccount() {
	return {
		type: ACCOUNT_CLOSE,
	};
}

export function closeAccountSuccess() {
	return async ( dispatch ) => {
		await clearStore();
		dispatch( {
			type: ACCOUNT_CLOSE_SUCCESS,
		} );
	};
}
