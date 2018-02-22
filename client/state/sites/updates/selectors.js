/** @format */

export const getUpdatesBySiteId = ( state, siteId ) => {
	return state.sites.updates.items[ siteId ] || null;
};
