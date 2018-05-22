/** @format */

/**
 * Internal dependencies
 */
import { ACCOUNT_CLOSE } from 'state/action-types';

export function closeAccount() {
	return {
		type: ACCOUNT_CLOSE,
	};
}
