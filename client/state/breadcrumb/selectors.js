import 'calypso/state/breadcrumb/init';

export const getBreadcrumbs = ( state, siteId ) => {
	return state.breadcrumbs?.[ siteId ] || [];
};
