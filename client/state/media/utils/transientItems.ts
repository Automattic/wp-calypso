type TransientItemSiteState = {
	transientItems: { [ transientId: string ]: object };
	transientIdsToServerIds: { [ transientId: string ]: number };
};

type TransientItemsState = {
	[ siteId: number ]: TransientItemSiteState;
};

/**
 * Wraps the transformation of a site's transientItems state. This cuts down
 * on boilerplate in the reducer, especially when it comes to null-safe defaults.
 *
 * @param state The full `transientItems` state
 * @param siteId The ID of the site being transformed
 * @param map A function accepting the transient items state for a site and returning a new state for the site
 */
export const transformSite = (
	state: TransientItemsState,
	siteId: number,
	map: ( previousState: TransientItemSiteState ) => TransientItemSiteState
): TransientItemsState => {
	const {
		[ siteId ]: {
			transientItems: siteTransientItems = {},
			transientIdsToServerIds: siteTransientIdsToServerIds = {},
		} = {},
	} = state;
	return {
		...state,
		[ siteId ]: map( {
			transientItems: siteTransientItems,
			transientIdsToServerIds: siteTransientIdsToServerIds,
		} ),
	};
};
