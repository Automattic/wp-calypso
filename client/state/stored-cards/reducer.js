/* eslint-disable no-case-declarations */
/**
 * Internal dependencies
 */
import {
	STORED_CARDS_ADD_COMPLETED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
} from 'state/action-types';
import { combineReducers, withSchemaValidation } from 'state/utils';
import { storedCardsSchema } from './schema';

/**
 * `Reducer` function which handles request/response actions
 * concerning stored cards data updates
 *
 * @param  {Array}  state  Current state
 * @param  {object} action storeCard action
 * @returns {Array}         Updated state
 */
export const items = withSchemaValidation( storedCardsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case STORED_CARDS_ADD_COMPLETED: {
			const { item } = action;
			return [ ...state, item ];
		}
		case STORED_CARDS_FETCH_COMPLETED: {
			const { list } = action;
			return list;
		}
		case STORED_CARDS_DELETE_COMPLETED: {
			const { card } = action;
			return state.filter(
				( item ) => ! card.allStoredDetailsIds.includes( item.stored_details_id )
			);
		}
	}

	return state;
} );

/**
 * Returns whether the list of stored cards has been loaded from the server in reaction to the specified action.
 *
 * @param {Array} state - current state
 * @param {object} action - action payload
 * @returns {boolean} - updated state
 */
export const hasLoadedFromServer = ( state = false, action ) => {
	switch ( action.type ) {
		case STORED_CARDS_FETCH_COMPLETED:
			return true;
	}

	return state;
};

/**
 * `Reducer` function which handles request/response actions
 * concerning stored cards fetching
 *
 * @param {object} state - current state
 * @param {object} action - storedCard action
 * @returns {object} updated state
 */
export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case STORED_CARDS_FETCH:
			return true;

		case STORED_CARDS_FETCH_COMPLETED:
		case STORED_CARDS_FETCH_FAILED:
			return false;
	}

	return state;
};

/**
 * `Reducer` function which handles request/response actions
 * concerning stored card deletion
 *
 * @param {object} state - current state
 * @param {object} action - storedCard action
 * @returns {object} updated state
 */
export const isDeleting = ( state = {}, action ) => {
	switch ( action.type ) {
		case STORED_CARDS_DELETE:
			return {
				...state,
				[ action.card.stored_details_id ]: true,
			};

		case STORED_CARDS_DELETE_FAILED:
		case STORED_CARDS_DELETE_COMPLETED:
			const nextState = { ...state };
			delete nextState[ action.card.stored_details_id ];
			return nextState;
	}

	return state;
};

export default combineReducers( {
	hasLoadedFromServer,
	isDeleting,
	isFetching,
	items,
} );
