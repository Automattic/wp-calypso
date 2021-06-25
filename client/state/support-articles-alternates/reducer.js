/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import {
	SUPPORT_ARTICLE_ALTERNATES_RECEIVE,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS,
	SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE,
} from 'calypso/state/action-types';

export const requests = ( state = {}, action ) => {
	switch ( action.type ) {
		case SUPPORT_ARTICLE_ALTERNATES_REQUEST: {
			return { ...state, [ action.postKey ]: {} };
		}
		case SUPPORT_ARTICLE_ALTERNATES_REQUEST_SUCCESS: {
			return { ...state, [ action.postKey ]: { completed: true } };
		}
		case SUPPORT_ARTICLE_ALTERNATES_REQUEST_FAILURE: {
			return { ...state, [ action.postKey ]: { failed: true } };
		}
	}

	return state;
};

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case SUPPORT_ARTICLE_ALTERNATES_RECEIVE: {
			return { ...state, [ action.postKey ]: action.payload };
		}
	}

	return state;
};

export default combineReducers( {
	requests,
	items,
} );
