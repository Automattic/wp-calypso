
export const isRequestingSiteUpdates = ( state, siteId ) => {
	return state.sites.updates.requesting[ siteId ] || false;
};

export const getUpdatesBySiteId = ( state, siteId ) => {
	return state.sites.updates.items[ siteId ] || [];
};

export const hasWordPressActualization = ( state, siteId ) => {
	const { wordpress, wp_update_version } = state.sites.updates.items[ siteId ] || {};
	return !! wordpress && wp_update_version;
};
