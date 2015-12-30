function updatePluginState( state = {}, pluginSlug, attributes ) {
	return Object.assign( {},
		state,
		{ [ pluginSlug ]: Object.assign( {}, state[ pluginSlug ], attributes ) }
	);
}

function reducer( state = {}, action ) {
	const { type, pluginSlug } = action;
	switch ( type ) {
		case 'FETCH_WPORG_PLUGINS_LIST':
			return updatePluginState( state, pluginSlug, { isFetching: true } );

		case 'RECEIVE_WPORG_PLUGIN_DATA':
			if ( action.data ) {
				return updatePluginState( state, pluginSlug, Object.assign( { isFetching: false, fetched: true }, action.data ) );
			}

		default:
			return state;
	}
}

export default reducer;
