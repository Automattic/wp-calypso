import { DataViewsState } from './types';

export const initialSitesViewState: DataViewsState = {
	type: 'table',
	perPage: 50,
	page: 1,
	sort: {
		field: 'site',
		direction: 'asc',
	},
	search: '',
	hiddenFields: [],
	layout: {},
	selectedSiteId: undefined,
};
