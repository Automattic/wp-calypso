/**
 * Internal dependencies
 */
import { UTILS_UNIQUEID_INCREMENT } from 'state/action-types';

export function uniqueId( prefix ) {
	return ( dispatch, getState ) => {
		dispatch( { type: UTILS_UNIQUEID_INCREMENT } );
		const id = getState().utils.uniqueId + '';
		return prefix ? prefix + id : id;
	};
}
