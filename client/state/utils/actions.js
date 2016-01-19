/**
 * Internal dependencies
 */
import { UTILS_UNIQUEID_INCREMENT } from 'state/action-types';

export function uniqueIdIncrement() {
	return { type: UTILS_UNIQUEID_INCREMENT };
}

export function uniqueId( prefix ) {
	return ( dispatch, getState ) => {
		dispatch( uniqueIdIncrement() );
		const id = getState().utils.uniqueId.toString();
		return prefix ? prefix + id : id;
	};
}
