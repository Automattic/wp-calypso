/**
 * Internal dependencies
 */
import {
	PLUGINS_WPORG_LIST_RECEIVE,
	PLUGINS_WPORG_LIST_REQUEST,
	PLUGINS_WPORG_PLUGIN_RECEIVE,
	PLUGINS_WPORG_PLUGIN_REQUEST,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

function updatePluginState( state = {}, pluginSlug, attributes ) {
	return Object.assign( {}, state, {
		[ pluginSlug ]: Object.assign( {}, state[ pluginSlug ], attributes ),
	} );
}

export function fetchingItems( state = {}, action ) {
	switch ( action.type ) {
		case PLUGINS_WPORG_PLUGIN_REQUEST:
			return Object.assign( {}, state, { [ action.pluginSlug ]: true } );
		case PLUGINS_WPORG_PLUGIN_RECEIVE:
			return Object.assign( {}, state, { [ action.pluginSlug ]: false } );
	}
	return state;
}

export function fetchingLists( state = {}, action ) {
	switch ( action.type ) {
		case PLUGINS_WPORG_LIST_REQUEST:
		case PLUGINS_WPORG_LIST_RECEIVE:
			if ( action.category ) {
				return {
					...state,
					category: {
						...state.category,
						[ action.category ]: action.type === PLUGINS_WPORG_LIST_REQUEST,
					},
				};
			} else if ( action.searchTerm ) {
				return {
					...state,
					search: {
						...state.search,
						[ action.searchTerm ]: action.type === PLUGINS_WPORG_LIST_REQUEST,
					},
				};
			}
	}
	return state;
}

export function items( state = {}, action ) {
	const { type, pluginSlug } = action;
	switch ( type ) {
		case PLUGINS_WPORG_PLUGIN_RECEIVE:
			if ( action.data ) {
				return updatePluginState(
					state,
					pluginSlug,
					Object.assign( { fetched: true, wporg: true }, action.data )
				);
			}
			return updatePluginState(
				state,
				pluginSlug,
				Object.assign( { fetched: false, wporg: false } )
			);
		default:
			return state;
	}
}

export function lists( state = {}, action ) {
	const { category, data, searchTerm, type } = action;
	switch ( type ) {
		case PLUGINS_WPORG_LIST_RECEIVE:
			if ( ! data ) {
				return state;
			}

			// We only need lists by category and search terms.
			if ( category ) {
				const prevCategoryState = state.category?.[ category ] ?? [];
				return {
					...state,
					category: {
						...state.category,
						[ category ]: [ ...prevCategoryState, ...data ],
					},
				};
			} else if ( searchTerm ) {
				const prevSearchState = state.search?.[ searchTerm ] ?? [];
				return {
					...state,
					search: {
						...state.search,
						[ searchTerm ]: [ ...prevSearchState, ...data ],
					},
				};
			}
		default:
			return state;
	}
}

export function listsPagination( state = {}, action ) {
	switch ( action.type ) {
		case PLUGINS_WPORG_LIST_RECEIVE:
			// The API supports pagination only for categories right now
			if ( action.pagination && action.category ) {
				return {
					...state,
					category: {
						...state.category,
						[ action.category ]: action.pagination,
					},
				};
			}
	}
	return state;
}

export default combineReducers( {
	fetchingItems,
	fetchingLists,
	items,
	lists,
	listsPagination,
} );
