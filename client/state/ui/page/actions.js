/**
 * Internal dependencies
 */
import { SET_PAGE_STATE, RESET_PAGE_STATE } from 'state/action-types';

export function setPageState( key, value ) {
	return {
		type: SET_PAGE_STATE,
		key,
		value
	};
}

export function resetPageState() {
	return {
		type: RESET_PAGE_STATE
	};
}
