import { withStorageKey } from '@automattic/state-utils';
import {
	STORED_CARDS_ADD_COMPLETED,
	STORED_CARDS_FETCH,
	STORED_CARDS_FETCH_COMPLETED,
	STORED_CARDS_FETCH_FAILED,
	STORED_CARDS_DELETE,
	STORED_CARDS_DELETE_COMPLETED,
	STORED_CARDS_DELETE_FAILED,
	STORED_CARDS_UPDATE_IS_BACKUP_COMPLETED,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { storedCardsSchema } from './schema';
import type { StoredCardsActions, StoredCardsState } from './types';

/**
 * `Reducer` function which handles request/response actions
 * concerning stored cards data updates
 */
export const items = withSchemaValidation(
	storedCardsSchema,
	( state: StoredCardsState[ 'items' ] | undefined = [], action: StoredCardsActions ) => {
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
			case STORED_CARDS_UPDATE_IS_BACKUP_COMPLETED: {
				const { stored_details_id, is_backup } = action;
				return state.map( ( item ) => {
					if ( item.stored_details_id === stored_details_id && item.meta ) {
						return {
							...item,
							meta: [
								...( item.meta?.filter( ( meta ) => meta.meta_key !== 'is_backup' ) ?? {} ),
								{ meta_key: 'is_backup', meta_value: is_backup ? 'backup' : null },
							],
						};
					}
					return item;
				} );
			}
		}

		return state;
	}
);

/**
 * Returns whether the list of stored cards has been loaded from the server in reaction to the specified action.
 */
export const hasLoadedFromServer = (
	state: StoredCardsState[ 'hasLoadedFromServer' ] | undefined = false,
	action: StoredCardsActions
) => {
	switch ( action.type ) {
		case STORED_CARDS_FETCH_COMPLETED:
			return true;
	}

	return state;
};

/**
 * `Reducer` function which handles request/response actions
 * concerning stored cards fetching
 */
export const isFetching = (
	state: StoredCardsState[ 'isFetching' ] | undefined = false,
	action: StoredCardsActions
) => {
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
 */
export const isDeleting = (
	state: StoredCardsState[ 'isDeleting' ] | undefined = {},
	action: StoredCardsActions
) => {
	switch ( action.type ) {
		case STORED_CARDS_DELETE:
			return {
				...state,
				[ action.card.stored_details_id ]: true,
			};

		case STORED_CARDS_DELETE_FAILED:
		case STORED_CARDS_DELETE_COMPLETED: {
			const nextState = { ...state };
			delete nextState[ action.card.stored_details_id ];
			return nextState;
		}
	}

	return state;
};

const combinedReducer = combineReducers( {
	hasLoadedFromServer,
	isDeleting,
	isFetching,
	items,
} );

export default withStorageKey( 'storedCards', combinedReducer );
