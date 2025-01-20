import { combineReducers } from 'calypso/state/utils';
import {
	READER_USER__REQUEST,
	READER_USER__REQUEST_SUCCESS,
	READER_USER__REQUEST_FAILURE,
} from '../action-types';

// Stores the user data
const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER__REQUEST_SUCCESS:
			return {
				...state,
				[ action.userId ]: action.userData,
			};
		case READER_USER__REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: null,
			};
		default:
			return state;
	}
};

// Tracks loading states
const requesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER__REQUEST:
			return {
				...state,
				[ action.userId ]: true,
			};
		case READER_USER__REQUEST_SUCCESS:
		case READER_USER__REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: false,
			};
		default:
			return state;
	}
};

export default combineReducers( {
	items,
	requesting,
} );
