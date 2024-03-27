import { SitesViewState } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import { AgencyDashboardFilterMap } from './types';

export const A4A_SITES_DASHBOARD_DEFAULT_CATEGORY = 'overview';

export const filtersMap: AgencyDashboardFilterMap[] = [
	{ filterType: 'all_issues', ref: 1 },
	{ filterType: 'backup_failed', ref: 2 },
	{ filterType: 'backup_warning', ref: 3 },
	{ filterType: 'threats_found', ref: 4 },
	{ filterType: 'site_disconnected', ref: 5 },
	{ filterType: 'site_down', ref: 6 },
	{ filterType: 'plugin_updates', ref: 7 },
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
	hiddenFields: [ 'status' ],
	layout: {},
	selectedSite: undefined,
};
