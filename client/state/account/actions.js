import { ACCOUNT_CLOSE, ACCOUNT_CLOSE_SUCCESS, ACCOUNT_RESTORE } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/me/account/close';
import 'calypso/state/data-layer/wpcom/me/account/restore';
import 'calypso/state/account/init';

export function closeAccount() {
	return {
		type: ACCOUNT_CLOSE,
	};
}

export function closeAccountSuccess( response ) {
	return {
		type: ACCOUNT_CLOSE_SUCCESS,
		payload: response,
	};
}

export function restoreAccount( token ) {
	return {
		type: ACCOUNT_RESTORE,
		payload: { token },
	};
}
