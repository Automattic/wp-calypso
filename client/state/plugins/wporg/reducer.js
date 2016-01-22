/**
 * Internal dependencies
 */
import { WPORG_PLUGIN_DATA_RECEIVE, FETCH_WPORG_PLUGIN_DATA } from 'state/action-types';

function updatePluginState( state = {}, pluginSlug, attributes ) {
	return Object.assign( {},
		state,
		{ [ pluginSlug ]: Object.assign( {}, state[ pluginSlug ], attributes ) }
	);
}

function reducer( state = {}, action ) {
	const { type, pluginSlug } = action;
	switch ( type ) {
		case WPORG_PLUGIN_DATA_RECEIVE:
			if ( action.data ) {
				return updatePluginState( state, pluginSlug, Object.assign( { isFetching: false, fetched: true, wporg: true }, action.data ) );
			}
			return updatePluginState( state, pluginSlug, Object.assign( { isFetching: false, fetched: false, wporg: false } ) );

		case FETCH_WPORG_PLUGIN_DATA:
			return updatePluginState( state, pluginSlug, Object.assign( { isFetching: true } ) );

		default:
			return state;
	}
}

export default reducer;
