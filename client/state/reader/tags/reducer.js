/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	READER_TAG_RECEIVE,
	READER_TAG_REQUEST,
	READER_TAG_REQUEST_SUCCESS,
	READER_TAG_REQUEST_FAILURE,
	READER_TAGS_RECEIVE,
	READER_TAGS_REQUEST,
	READER_TAGS_REQUEST_SUCCESS,
	READER_TAGS_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

export function items( state = {}, action ) {
	/*
	switch ( action.type ) {
	}
	*/
	return state;
}

/**
 * Tracks which tag IDs the current user is subscribed to.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function subscribedTags( state = [], action ) {
	/*
	switch ( action.type ) {
		case READER_TAGS_RECEIVE:
			return union( state, map( action.tags, 'ID' ) );
		case READER_TAGS_UNFOLLOW_SUCCESS:
			// Remove the unfollowed tag ID from subscribedTags
			return filter( state, ( tagId ) => {
				return tagId !== action.data.tag.ID;
			} );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, subscriptionsSchema ) ) {
				return [];
			}
	}
	*/
	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingTag( state = false, action ) {
	switch ( action.type ) {
		case READER_TAG_REQUEST:
		case READER_TAG_REQUEST_SUCCESS:
		case READER_TAG_REQUEST_FAILURE:
			return READER_TAG_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

/**
 * Returns the updated requests state after an action has been dispatched.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function isRequestingTags( state = false, action ) {
	switch ( action.type ) {
		case READER_TAGS_REQUEST:
		case READER_TAGS_REQUEST_SUCCESS:
		case READER_TAGS_REQUEST_FAILURE:
			return READER_TAGS_REQUEST === action.type;

		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
}

/**
 * Returns errors received when trying to update tags, keyed by tag ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function errors( state = {}, action ) {
	/*
	switch ( action.type ) {
		case READER_LIST_UPDATE_FAILURE:
			const newError = {};
			newError[ action.list.ID ] = action.error.statusCode;
			return Object.assign( {}, state, newError );

		case READER_LIST_DISMISS_NOTICE:
			// Remove the dismissed list ID
			return omit( state, action.listId );

		case SERIALIZE:
		case DESERIALIZE:
			if ( ! isValidStateWithSchema( state, errorsSchema ) ) {
				return {};
			}
	}
	*/
	return state;
}

export default combineReducers( {
	items,
	subscribedTags,
	isRequestingTag,
	isRequestingTags,
	errors
} );
