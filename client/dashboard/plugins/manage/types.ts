// Centralized types for the dashboard plugins package

import { MarketplacePlugin, WpOrgPlugin } from '@automattic/api-core';

export type PluginListRow = {
	id: string;
	slug: string;
	name: string;
	icons: MarketplacePlugin[ 'icons' ] | WpOrgPlugin[ 'icons' ];
	sitesCount: number;
	isActive: 'all' | 'some' | 'none';
	hasUpdate: 'all' | 'some' | 'none';
	areAutoUpdatesAllowed: 'all' | 'some' | 'none';
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
