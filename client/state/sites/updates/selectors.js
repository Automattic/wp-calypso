
export const isRequestingSiteUpdates = ( state, siteId ) => {
	return state.sites.updates.requesting[ siteId ] || false;
};

export const getUpdatesBySiteId = ( state, siteId ) => {
	return state.sites.updates.items[ siteId ] || null;
};
