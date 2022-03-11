import 'calypso/state/breadcrumb/init';

export const getBreadcrumbs = ( state, siteId = 0 ) => {
	return state.breadcrumbs?.[ siteId ] || [];
};
