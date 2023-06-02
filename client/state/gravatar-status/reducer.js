import {
	GRAVATAR_UPLOAD_RECEIVE,
	GRAVATAR_UPLOAD_REQUEST,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const isUploading = ( state = false, action ) => {
	switch ( action.type ) {
		case GRAVATAR_UPLOAD_REQUEST:
			return true;
		case GRAVATAR_UPLOAD_REQUEST_SUCCESS:
			return false;
		case GRAVATAR_UPLOAD_REQUEST_FAILURE:
			return false;
	}

	return state;
};

export const tempImage = ( state = null, action ) => {
	switch ( action.type ) {
		case GRAVATAR_UPLOAD_RECEIVE: {
			return action.src;
		}
	}

	return state;
};

export default combineReducers( {
	isUploading,
	tempImage,
} );
