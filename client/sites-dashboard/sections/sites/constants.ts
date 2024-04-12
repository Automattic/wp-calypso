import { DashboardFilterMap } from './sites-overview/types';
import { SitesViewState } from './types';

export const SITES_DASHBOARD_DEFAULT_CATEGORY = 'overview';

export const filtersMap: DashboardFilterMap[] = [
	{ filterType: 'all_sites', ref: 1 },
	{ filterType: 'public', ref: 2 },
	{ filterType: 'private', ref: 3 },
	{ filterType: 'coming_soon', ref: 4 },
	{ filterType: 'redirect', ref: 5 },
	{ filterType: 'deleted', ref: 6 },
];

export const initialSitesViewState: SitesViewState = {
	type: 'table',
	perPage: 50,
	page: 1,
	sort: {
		field: 'url',
		direction: 'desc',
	},
	search: '',
	filters: [],
	hiddenFields: [],
	layout: {},
	selectedSite: undefined,
};
