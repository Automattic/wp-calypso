export const initialSitesViewState = {
	type: 'table',
	perPage: 50,
	page: 1,
	sort: {
		field: 'site',
		direction: 'asc',
	},
	search: '',
	filters: [],
	layout: {},
	hiddenFields: [],
	selectedSite: undefined,
};
