import {
	READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { combineReducers } from 'calypso/state/utils';

export const userRecommendedBlogs = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE:
			return {
				...state,
				[ action.listOwner ]: action.listItems,
			};
		default:
			return state;
	}
};

export const isRequestingUserRecommendedBlogs = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_RECOMMENDED_BLOGS_ITEMS_REQUEST:
			return {
				...state,
				[ action.listOwner ]: true,
			};
		case READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE:
		case READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE:
			return {
				...state,
				[ action.listOwner ]: false,
			};
		default:
			return state;
	}
};

export default combineReducers( {
	userRecommendedBlogs,
	isRequestingUserRecommendedBlogs,
} );
