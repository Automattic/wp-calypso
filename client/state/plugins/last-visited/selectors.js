import 'calypso/state/plugins/init';

export const getLastVisitedPlugin = function ( state ) {
	return state.plugins.lastVisited;
};

export const isLastVisitedPlugin = function ( state, pluginSlug, pluginListName ) {
	const lastVisitedPlugin = getLastVisitedPlugin( state );
	const { slug, listName } = lastVisitedPlugin || {};
	return slug === pluginSlug && listName === pluginListName;
};
