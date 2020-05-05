export const getPlugin = function ( state, pluginSlug ) {
	if ( ! state || ! state[ pluginSlug ] ) {
		return null;
	}
	return Object.assign( {}, state[ pluginSlug ] );
};

export const isFetching = function ( state, pluginSlug ) {
	// if the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( typeof state[ pluginSlug ] === 'undefined' ) {
		return true;
	}
	return state[ pluginSlug ];
};

export const isFetched = function ( state, pluginSlug ) {
	const plugin = getPlugin( state, pluginSlug );
	// if the plugin or the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( ! plugin ) {
		return false;
	}
	return !! plugin.fetched;
};
