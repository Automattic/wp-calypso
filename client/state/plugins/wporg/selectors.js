const getPlugin = function( state, pluginSlug ) {
	if ( ! state || ! state[ pluginSlug ] ) {
		return null;
	}
	return Object.assign( {}, state[ pluginSlug ] );
};

const isFetching = function( state, pluginSlug ) {
	// if the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( typeof state[ pluginSlug ] === 'undefined' ) {
		return true;
	}
	return state[ pluginSlug ];
};

const isFetched = function( state, pluginSlug ) {
	const plugin = getPlugin( state, pluginSlug );
	// if the plugin or the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	if ( ! plugin ) {
		return false;
	}
	return !! plugin.fetched;
};

const canFetchList = function( state, category, page, searchTerm ) {
	const { lists } = state.plugins.wporg;
	if ( searchTerm && lists.fetching.search ) {
		return false;
	}
	if ( lists.fetching[ category ] ) {
		return false;
	}

	if ( lists.lastFetchedPage[ category ] >= page ) {
		return false;
	}

	return true;
};

const isFetchingList = function( state, category ) {
	return !! state.plugins.wporg.lists.fetching[ category ];
};

const getCurrentSearchTerm = function( state ) {
	return state.plugins.wporg.lists.currentSearchTerm;
};

const getList = function( state, category ) {
	return state.plugins.wporg.lists.fullLists[ category ] ? state.plugins.wporg.lists.fullLists[ category ] : [];
};

const getShortList = function( state, category ) {
	return state.plugins.wporg.lists.shortLists[ category ] ? state.plugins.wporg.lists.shortLists[ category ] : [];
};

export default { getPlugin, isFetching, isFetched, isFetchingList, canFetchList, getList, getShortList, getCurrentSearchTerm };
