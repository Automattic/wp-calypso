/**
 * Internal dependencies
 */

import { PLUGINS_WPORG_PLUGIN_RECEIVE, FETCH_WPORG_PLUGIN_DATA } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

function updatePluginState( state = {}, pluginSlug, attributes ) {
	return Object.assign( {}, state, {
		[ pluginSlug ]: Object.assign( {}, state[ pluginSlug ], attributes ),
	} );
}

export function fetchingItems( state = {}, action ) {
	switch ( action.type ) {
		case FETCH_WPORG_PLUGIN_DATA:
			return Object.assign( {}, state, { [ action.pluginSlug ]: true } );
		case PLUGINS_WPORG_PLUGIN_RECEIVE:
			return Object.assign( {}, state, { [ action.pluginSlug ]: false } );
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

export default combineReducers( {
	items,
	fetchingItems,
} );
