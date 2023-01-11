import type { ReactChild } from 'react';

// All types based on which the data is populated on the agency dashboard table rows
export type AllowedTypes = 'site' | 'backup' | 'scan' | 'monitor' | 'plugin';

// Site column object which holds key and title of each column
export type SiteColumns = Array< {
	key: string;
	title: ReactChild;
	className?: string;
} >;

export type AllowedStatusTypes =
	| 'inactive'
	| 'progress'
	| 'failed'
	| 'warning'
	| 'success'
	| 'disabled';

export interface MonitorSettings {
	monitor_active: boolean;
	last_down_time: string;
	monitor_deferment_time: number;
	monitor_notify_users_emails: Array< string >;
}

export interface Site {
	blog_id: number;
	url: string;
	url_with_scheme: string;
	monitor_active: boolean;
	monitor_site_status: boolean;
	has_scan: boolean;
	has_backup: boolean;
	latest_scan_threats_found: Array< any >;
	latest_backup_status: string;
	is_connection_healthy: boolean;
	awaiting_plugin_updates: Array< string >;
	is_favorite: boolean;
	monitor_settings: MonitorSettings;
	monitor_last_status_change: string;
}
export interface SiteNode {
	value: Site;
	error: boolean;
	type: AllowedTypes;
	status: AllowedStatusTypes | string;
}

export interface BackupNode {
	type: AllowedTypes;
	status: AllowedStatusTypes | string;
	value: ReactChild;
}

export interface ScanNode {
	type: AllowedTypes;
	status: AllowedStatusTypes | string;
	value: ReactChild;
	threats: number;
}

interface PluginNode {
	type: AllowedTypes;
	status: AllowedStatusTypes;
	value: ReactChild;
	updates: number;
}
export interface MonitorNode {
	type: AllowedTypes;
	status: AllowedStatusTypes | string;
	value: ReactChild;
	error?: boolean;
	settings?: MonitorSettings;
}
export interface SiteData {
	site: SiteNode;
	backup: BackupNode;
	scan: ScanNode;
	plugin: PluginNode;
	monitor: MonitorNode;
	isFavorite?: boolean;
	[ key: string ]: any;
}

export interface RowMetaData {
	row: {
		value: Site | any;
		status: AllowedStatusTypes | string;
		error?: boolean;
	};
	link: string;
	isExternalLink: boolean;
	siteError: boolean;
	tooltip: ReactChild | undefined;
	tooltipId: string;
	siteDown?: boolean;
	eventName: string | undefined;
}

export type PreferenceType = 'dismiss' | 'view';

export type Preference = {
	dismiss?: boolean;
	view?: boolean;
};

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
	filter: { issueTypes: Array< AgencyDashboardFilterOption >; showOnlyFavorites: boolean };
}

export type AgencyDashboardFilterOption =
	| 'backup_failed'
	| 'backup_warning'
	| 'threats_found'
	| 'site_disconnected'
	| 'plugin_updates';

export type AgencyDashboardFilter = {
	issueTypes: Array< AgencyDashboardFilterOption | string >;
	showOnlyFavorites: boolean;
};

export type ProductInfo = { name: string; key: string; status: 'rejected' | 'fulfilled' };

export type PurchasedProductsInfo = {
	selectedSite: string;
	selectedProducts: Array< ProductInfo >;
};

export interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

export interface APIToggleFavorite {
	[ key: string ]: any;
}

export interface UpdateMonitorSettingsAPIResponse {
	success: boolean;
	settings: {
		monitor_active: boolean;
		email_notifications: boolean;
		wp_note_notifications: boolean;
		jetmon_defer_status_down_minutes: number;
	};
}

export interface UpdateMonitorSettingsParams {
	monitor_active?: boolean;
	wp_note_notifications?: boolean;
	email_notifications?: boolean;
	jetmon_defer_status_down_minutes?: number;
}
export interface UpdateMonitorSettingsArgs {
	siteId: number;
	params: UpdateMonitorSettingsParams;
}

export type SiteMonitorStatus = {
	[ siteId: number ]: 'loading' | 'completed';
};
