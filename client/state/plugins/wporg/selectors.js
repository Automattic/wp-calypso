export function getPlugin( state, pluginSlug ) {
	let plugins;
	// Some components just pass in the list of plugins, not the entire state.
	if ( ! state.hasOwnProperty( 'plugins' ) ) {
		plugins = state;
	} else {
		plugins = state.plugins.wporg.items;
	}
	if ( typeof plugins[ pluginSlug ] === 'undefined' ) {
		return null;
	}
	return Object.assign( {}, plugins[ pluginSlug ] );
}

export function isFetching( state, pluginSlug ) {
	// if the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	let fetching;
	// Some components just pass in the list of plugins, not the entire state.
	if ( ! state.hasOwnProperty( 'plugins' ) ) {
		fetching = state;
	} else {
		fetching = state.plugins.wporg.fetchingItems;
	}
	if ( typeof fetching[ pluginSlug ] === 'undefined' ) {
		return true;
	}
	return fetching[ pluginSlug ];
}

export function isFetched( state, pluginSlug ) {
	const plugin = getPlugin( state, pluginSlug );
	// if the plugin or the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( ! plugin ) {
		return false;
	}
	return !! plugin.fetched;
}
