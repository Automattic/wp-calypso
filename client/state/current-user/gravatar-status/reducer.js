/**
 * Internal dependencies
 */
import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE
} from 'state/action-types';
import { combineReducersWithPersistence, createReducer } from 'state/utils';

export const isUploading = createReducer( false, {
	[ GRAVATAR_UPLOAD_REQUEST ]: () => true,
	[ GRAVATAR_UPLOAD_REQUEST_SUCCESS ]: () => false,
	[ GRAVATAR_UPLOAD_REQUEST_FAILURE ]: () => false
} );

export const tempImage = createReducer( {}, {
	[ GRAVATAR_UPLOAD_RECEIVE ]: ( state, action ) => {
		return {
			src: action.src
		};
	}
} );

export default combineReducersWithPersistence( {
	isUploading,
	tempImage
} );
