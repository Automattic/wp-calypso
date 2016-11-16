/**
 * External dependencies
 */
import { find, flatten, get, values } from 'lodash';

export const getRequest = ( state, uid, type, options = {} ) => {
	const optionsSerialization = JSON.stringify( options );
	return find( get( state.requests, [ uid ], [] ), request => {
		return request.type === type && request.options === optionsSerialization;
	} );
};

export const getRequestIgnoringUid = ( state, type, options = {} ) => {
	const optionsSerialization = JSON.stringify( options );
	return find( flatten( values( state.requests ) ), request => {
		return request.type === type && request.options === optionsSerialization;
	} );
};
