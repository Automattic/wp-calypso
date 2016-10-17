/**
 * External dependencies
 */
import { combineReducers } from 'redux';
/**
 * Internal dependencies
 */
import {
	WPORG_PLUGIN_DATA_RECEIVE,
	FETCH_WPORG_PLUGIN_DATA,
	WPORG_PLUGIN_RECEIVE_LIST,
	WPORG_PLUGIN_FETCH_LIST,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

/**
 * Constants
 */
const _DEFAULT_FIRST_PAGE = 0;

function updatePluginState( state = {}, pluginSlug, attributes ) {
	return Object.assign( {},
		state,
		{ [ pluginSlug ]: Object.assign( {}, state[ pluginSlug ], attributes ) }
	);
}

const defaultPluginsListState = ( {
	shortLists: {},
	fullLists: {},
	currentSearchTerm: null,
	fetching: {},
	lastFetchedPage: {}
} );

function updatePluginsList( state = defaultPluginsListState, category, page, list ) {
	if ( ! page || page === _DEFAULT_FIRST_PAGE ) {
		state.shortLists[ category ] = Object.assign( [], list.slice( 0, 6 ) );
		state.fullLists[ category ] = Object.assign( [], list );
	} else {
		const fullList = state.fullLists[ category ] || [];
		state.fullLists[ category ] = fullList.concat( Object.assign( [], list ) );
	}
	state.fetching[ category ] = false;
	state.lastFetchedPage[ category ] = page;
	return state;
}

export function fetchingItems( state = {}, action ) {
	switch ( action.type ) {
		case FETCH_WPORG_PLUGIN_DATA:
			return Object.assign( {}, state, { [ action.pluginSlug ]: true } );
		case WPORG_PLUGIN_DATA_RECEIVE:
			return Object.assign( {}, state, { [ action.pluginSlug ]: false } );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function items( state = {}, action ) {
	const { type, pluginSlug } = action;
	switch ( type ) {
		case WPORG_PLUGIN_DATA_RECEIVE:
			if ( action.data ) {
				return updatePluginState( state, pluginSlug, Object.assign( { fetched: true, wporg: true }, action.data ) );
			}
			return updatePluginState( state, pluginSlug, Object.assign( { fetched: false, wporg: false } ) );

		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
}

export function lists( state = defaultPluginsListState, action ) {
	const { type, category, page, data } = action;
	switch ( type ) {
		case WPORG_PLUGIN_RECEIVE_LIST:
			return Object.assign( {}, state, updatePluginsList( defaultPluginsListState, category, page, data ) );
		case WPORG_PLUGIN_FETCH_LIST:
			const nextState = defaultPluginsListState;
			if ( action.category ) {
				nextState.fetching[ action.category ] = true;
				nextState.currentSearchTerm = action.searchTerm;
				if ( nextState.currentSearchTerm !== state.currentSearchTerm ) {
					nextState.lastFetchedPage.search = -1;
				}
				nextState.lastFetchedPage[ action.category ] = action.page;
				if ( action.category === 'search' ) {
					nextState.currentSearchTerm = action.searchTerm;
					if ( action.page === 0 ) {
						return Object.assign( {}, state, updatePluginsList( nextState, 'search', 0, [] ) );
					}
				}
			}
			return Object.assign( {}, state, nextState );
		case SERIALIZE:
		case DESERIALIZE:
			return defaultPluginsListState;
	}
	return state;
}

export default combineReducers( {
	items,
	fetchingItems,
	lists
} );
