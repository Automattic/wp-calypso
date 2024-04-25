import { JETPACK_BOOST_ID } from 'calypso/a8c-for-agencies/sections/sites/features/features';
import { AgencyDashboardFilterMap } from './types';

export const A4A_SITES_DASHBOARD_DEFAULT_CATEGORY = 'overview';
export const A4A_SITES_DASHBOARD_DEFAULT_FEATURE = JETPACK_BOOST_ID;

export const DEFAULT_SORT_FIELD = 'url';
export const DEFAULT_SORT_DIRECTION = 'asc';

export const filtersMap: AgencyDashboardFilterMap[] = [
	{ filterType: 'all_issues', ref: 1 },
	{ filterType: 'backup_failed', ref: 2 },
	{ filterType: 'backup_warning', ref: 3 },
	{ filterType: 'threats_found', ref: 4 },
	{ filterType: 'site_disconnected', ref: 5 },
	{ filterType: 'site_down', ref: 6 },
	{ filterType: 'plugin_updates', ref: 7 },
];
