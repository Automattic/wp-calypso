/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

export function getAllPlugins( state ) {
	return state?.plugins.wporg.items;
}

export function getPlugin( state, pluginSlug ) {
	const plugin = state?.plugins.wporg.items[ pluginSlug ] ?? null;
	return plugin ? { ...plugin } : plugin;
}

export function isFetching( state, pluginSlug ) {
	// if the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	const status = state?.plugins.wporg.fetchingItems[ pluginSlug ];
	return status === undefined ? true : status;
}

export function isFetched( state, pluginSlug ) {
	const plugin = getPlugin( state, pluginSlug );
	// if the plugin or the `isFetching` attribute doesn't exist yet,
	// we assume we are still launching the fetch action, so it's true
	return plugin ? !! plugin.fetched : false;
}
