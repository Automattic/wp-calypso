import 'calypso/state/plugins/init';

export const getLastVisitedPlugin = function ( state ) {
	return state.plugins.lastVisited;
};

export const isLastVisitedPlugin = function ( state, pluginSlug ) {
	return getLastVisitedPlugin( state ) === pluginSlug;
};
