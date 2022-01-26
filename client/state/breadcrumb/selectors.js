import 'calypso/state/breadcrumb/init';

export const getBreadcrumbs = ( state ) => {
	return state.breadcrumb?.items;
};
