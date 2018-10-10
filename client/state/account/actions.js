/** @format */

/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE, ACCOUNT_CLOSE_SUCCESS } from 'state/action-types';

import 'state/data-layer/wpcom/me/account/close';

export function closeAccount() {
	return {
		type: ACCOUNT_CLOSE,
	};
}

export function closeAccountSuccess() {
	return {
		type: ACCOUNT_CLOSE_SUCCESS,
	};
}
