/**
 * Internal dependencies
 */
import { REQUEST_ADD, REQUEST_REMOVE, REQUEST_CLEAR } from 'state/action-types';

export function addRequest( uid, type, options = {} ) {
	const createdAt = Date.now();

	return {
		type: REQUEST_ADD,
		payload: {
			uid,
			type,
			options,
			createdAt
		}
	};
}

export function removeRequest( uid, type, options = {} ) {
	return {
		type: REQUEST_REMOVE,
		payload: {
			uid,
			type,
			options
		}
	};
}

export function clearRequests( uid ) {
	return {
		type: REQUEST_CLEAR,
		payload: uid
	};
}
