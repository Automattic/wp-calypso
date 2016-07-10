/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED
} from 'state/action-types';

/**
 * `Reducer` function which handles request/response actions
 * concerning stored cards data updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action storeCard action
 * @return {Array}         Updated state
 */
export const items = ( state = [], action ) => {
	switch ( action.type ) {
		case STORED_CARDS_FETCH_COMPLETED:
			return action.list;

		case STORED_CARDS_DELETE_COMPLETED:
			return state.filter( item => item.stored_details_id !== action.card.stored_details_id );

		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return [];
	}

	return state;
};

/**
 * Returns whether the list of stored cards has been loaded from the server in reaction to the specified action.
 *
 * @param {Array} state - current state
 * @param {Object} action - action payload
 * @return {Boolean} - updated state
 */
export const hasLoadedFromServer = ( state = false, action ) => {
	switch ( action.type ) {
		case STORED_CARDS_FETCH_COMPLETED:
			return true;

		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

/**
 * `Reducer` function which handles request/response actions
 * concerning stored cards fetching
 *
 * @param {Object} state - current state
 * @param {Object} action - storedCard action
 * @return {Object} updated state
 */
export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case STORED_CARDS_FETCH:
			return true;

		case STORED_CARDS_FETCH_COMPLETED:
		case STORED_CARDS_FETCH_FAILED:
			return false;

		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

/**
 * `Reducer` function which handles request/response actions
 * concerning stored card deletion
 *
 * @param {Object} state - current state
 * @param {Object} action - storedCard action
 * @return {Object} updated state
 */
export const isDeleting = ( state = false, action ) => {
	switch ( action.type ) {
		case STORED_CARDS_DELETE:
			return true;

		case STORED_CARDS_DELETE_FAILED:
		case STORED_CARDS_DELETE_COMPLETED:
			return false;

		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return false;
	}

	return state;
};

export default combineReducers( {
	hasLoadedFromServer,
	isDeleting,
	isFetching,
	items
} );
