// Centralized types for the dashboard plugins package

export type PluginListRow = {
	id: string;
	slug: string;
	name: string;
	sitesCount: number;
	isActive: 'all' | 'some' | 'none';
	hasUpdate: 'all' | 'some' | 'none';
	areAutoUpdatesEnabled: 'all' | 'some' | 'none';
	siteIds: number[]; // list of site IDs where this plugin exists
};

export type SitePluginAction =
	| 'activate'
	| 'deactivate'
	| 'update'
	| 'enable-autoupdate'
	| 'disable-autoupdate'
	| 'remove';
