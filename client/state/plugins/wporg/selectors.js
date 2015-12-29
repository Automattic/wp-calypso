const getPlugin = function( state, pluginSlug ) {
	if ( ! state || ! state[ pluginSlug ] ) {
		return null;
	}
	return state[ pluginSlug ];
};

const isFetching = function( state, pluginSlug ) {
	const plugin = getPlugin( state, pluginSlug );
	return plugin && plugin.isFetching;
};

export default { getPlugin, isFetching };


