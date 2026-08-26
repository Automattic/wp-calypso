import 'calypso/state/plugins/init';

export const hasRequested = function ( state, siteId ) {
	if ( typeof state.plugins.premium.hasRequested[ siteId ] === 'undefined' ) {
		return false;
	}
	return state.plugins.premium.hasRequested[ siteId ];
};

/**
 * Gets the list of premium plugins and their API keys for a site.
 * @param {import('calypso/types').AppState} state The current state.
 * @param {number} siteId The site ID.
 * @returns {Array<{ slug: string; key: string; }>} The list of plugins.
 */
export const getPluginsForSite = function ( state, siteId ) {
	return state.plugins.premium.plugins[ siteId ] ?? [];
};
