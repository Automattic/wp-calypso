import { combineReducers } from 'calypso/state/utils';
import {
	READER_USER_REQUEST,
	READER_USER_REQUEST_SUCCESS,
	READER_USER_REQUEST_FAILURE,
	READER_USER_LISTS_REQUEST,
	READER_USER_LISTS_REQUEST_SUCCESS,
	READER_USER_LISTS_REQUEST_FAILURE,
} from '../action-types';

// Stores the user data
const profiles = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_REQUEST_SUCCESS:
			return {
				...state,
				[ action.userId ]: action.userData,
			};
		case READER_USER_REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: null,
			};
		default:
			return state;
	}
};

// Tracks loading states
const profileRequests = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_REQUEST:
			return {
				...state,
				[ action.userId ]: true,
			};
		case READER_USER_REQUEST_SUCCESS:
		case READER_USER_REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: false,
			};
		default:
			return state;
	}
};

const lists = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_LISTS_REQUEST_SUCCESS: {
			return {
				...state,
				[ action.userId ]: action.userData.lists,
			};
		}
		case READER_USER_LISTS_REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: null,
			};
		default:
			return state;
	}
};

const listRequests = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_USER_LISTS_REQUEST:
			return {
				...state,
				[ action.userId ]: true,
			};
		case READER_USER_LISTS_REQUEST_SUCCESS:
		case READER_USER_LISTS_REQUEST_FAILURE:
			return {
				...state,
				[ action.userId ]: false,
			};
		default:
			return state;
	}
};

export default combineReducers( {
	profiles,
	profileRequests,
	lists,
	listRequests,
} );
