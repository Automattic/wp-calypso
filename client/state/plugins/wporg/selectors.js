import 'calypso/state/plugins/init';

export function getAllPlugins( state ) {
	return state?.plugins.wporg.items;
}

export function getPlugin( state, pluginSlug ) {
	const plugin = state?.plugins.wporg.items[ pluginSlug ] ?? null;
	return plugin ? { ...plugin } : plugin;
}

export function getPlugins( state, pluginSlugs ) {
	return pluginSlugs.map( ( pluginSlug ) => getPlugin( state, pluginSlug ) );
}

export function isFetching( state, pluginSlug ) {
	return state?.plugins.wporg.fetchingItems[ pluginSlug ] ?? false;
}

export function hasError( state, pluginSlug ) {
	const plugin = getPlugin( state, pluginSlug );
	return plugin?.error ?? null;
}

export function isFetched( state, pluginSlug ) {
	const plugin = getPlugin( state, pluginSlug );
	return plugin ? !! plugin.fetched : false;
}

export function areFetched( state, pluginSlugs ) {
	return pluginSlugs.map( ( pluginSlug ) => isFetched( state, pluginSlug ) );
}

/**
 * WP.org plugins can be filtered either by category or search term.
 * So we can either be fetching by category or by search term.
 *
 * @param {object} state      State object
 * @param {string} category   Plugin category
 * @param {string} searchTerm Search term
 * @returns {boolean}         Whether that plugins list is being fetched
 */
export function isFetchingPluginsList( state, category, searchTerm ) {
	if ( category ) {
		return !! state.plugins.wporg.fetchingLists.category?.[ category ];
	} else if ( searchTerm ) {
		return !! state.plugins.wporg.fetchingLists.search?.[ searchTerm ];
	}

	return false;
}

/**
 * Retrieve the next page for the particular plugins list.
 *
 * @param {object} state    State object
 * @param {string} category Plugin category
 * @returns {?number}       Next page number, or null if there is no next page.
 */
export function getNextPluginsListPage( state, category ) {
	const pagination = state.plugins.wporg.listsPagination.category?.[ category ];

	if ( pagination && pagination.pages > pagination.page ) {
		return pagination.page + 1;
	}

	return null;
}
