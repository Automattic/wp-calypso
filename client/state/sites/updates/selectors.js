
export const isRequestingSiteUpdates = ( state, siteId ) => {
	return state.sites.updates.requesting[ siteId ] || false;
};

export const getUpdatesBySiteId = ( state, siteId ) => {
	return state.sites.updates.items[ siteId ] || [];
};

export const hasUpdates = ( state, siteId ) => {
	const { total } = state.sites.updates.items[ siteId ] || { total: 0 };
	return total > 0;
};

export const hasWordPressUpdate = ( state, siteId ) => {
	const { wordpress, wp_update_version } = getUpdatesBySiteId( state, siteId );
	return !! wordpress && wp_update_version;
};

export const getSectionsToUpdate = ( state, siteId ) => {
	const updates = getUpdatesBySiteId( state, siteId );
	const sectionsToUpdate = [ 'plugins', 'themes', 'translations', 'wordpress' ];

	return sectionsToUpdate
		.filter( section => updates[ section ] !== 'undefined' && updates[ section ] > 0 );
};
