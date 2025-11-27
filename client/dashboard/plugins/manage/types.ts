// Centralized types for the dashboard plugins package

export type PluginListRow = {
	id: string;
	slug: string;
	name: string;
	icon?: string;
	sitesCount: number;
	sitesWithPluginActive: number[];
	sitesWithPluginInactive: number[];
	isActive: 'all' | 'some' | 'none';
	hasUpdate: 'all' | 'some' | 'none';
	areAutoUpdatesAllowed: 'all' | 'some' | 'none';
	areAutoUpdatesEnabled: 'all' | 'some' | 'none';
	siteIds: number[]; // list of site IDs where this plugin exists
	isManaged: boolean;
};

export type SitePluginAction =
	| 'activate'
	| 'deactivate'
	| 'update'
	| 'enable-autoupdate'
	| 'disable-autoupdate'
	| 'remove';
