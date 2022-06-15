import type { ReactChild } from 'react';

// All types based on which the data is populated on the agency dashboard table rows
export type AllowedTypes = 'site' | 'backup' | 'scan' | 'monitor' | 'plugin';

// Site column object which holds key and title of each column
export type SiteColumns = Array< { key: string; title: ReactChild } >;

export interface SiteNode {
	value: { blog_id: number; url: string; url_with_scheme: string };
	error: boolean;
	type: AllowedTypes;
	status: string;
}
export interface SiteData {
	site: SiteNode;
	scan: { threats: number; type: AllowedTypes; status: AllowedStatusTypes; value: ReactChild };
	plugin: { updates: number; type: AllowedTypes; status: AllowedStatusTypes; value: ReactChild };
	[ key: string ]: any;
}

export type PreferenceType = 'dismiss' | 'view';

export type Preference = {
	dismiss?: boolean;
	view?: boolean;
};

export type FormattedRowObj = {
	value: ReactChild;
	status: string;
	type: string;
	threats?: number;
	error?: boolean;
};

export type AllowedStatusTypes = 'inactive' | 'progress' | 'failed' | 'warning' | 'success';

export type StatusEventNames = {
	[ key in AllowedStatusTypes | string ]: { small_screen: string; large_screen: string };
};

export type StatusTooltip = {
	[ key in AllowedStatusTypes | string ]: ReactChild;
};

export type AllowedActionTypes = 'issue_license' | 'view_activity' | 'view_site' | 'visit_wp_admin';

export type ActionEventNames = {
	[ key in AllowedActionTypes ]: { small_screen: string; large_screen: string };
};
export interface SitesOverviewContextInterface {
	search: string;
	currentPage: number;
	filter: { issueTypes: Array< string > };
}

export type AgencyDashboardFilterOption =
	| 'backup_failed'
	| 'backup_warning'
	| 'threats_found'
	| 'site_down'
	| 'plugin_updates';

export type AgencyDashboardFilter = {
	issueTypes: Array< AgencyDashboardFilterOption | string >;
};
