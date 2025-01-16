import { CurrentSiteStatus } from 'calypso/my-sites/plugins/plugin-management-v2/types';
import type { MomentInput } from 'moment';

// The installed plugins found in the Redux store
export type InstalledPlugins = {
	[ key: string ]: InstalledPluginData[];
};

export type InstalledPluginData = {
	author: string;
	author_url: string;
	description: string;
	id: string;
	name: string;
	network: boolean;
	plugin_url: string;
	slug: string;
	uninstallable: boolean;
} & PluginSite;

// This is the plugin as it is exposed by the selectors
export type Plugin = {
	action_links?: { Settings?: string; name?: string };
	fetched: boolean;
	icon: string;
	id: string;
	last_updated: MomentInput;
	name: string;
	sites: PluginSites;
	slug: string;
	statusRecentlyChanged?: boolean;
	update?: PluginUpdate;
	wporg?: boolean;
	status?: Array< number >;
	allStatuses?: Array< CurrentSiteStatus >;
	isMarketplaceProduct?: boolean;
};

export type PluginSite = {
	active: boolean;
	autoupdate: boolean;
	update?: PluginUpdate;
	version: string;
};

export type PluginSites = {
	[ siteId: string ]: PluginSite;
};

export type PluginUpdate = {
	id: string;
	new_version: string;
	package: string;
	recentlyUpdated?: boolean;
	slug: string;
	tested: string;
	url: string;
};

export type PluginFilter = 'none' | 'all' | 'active' | 'inactive' | 'updates';

export type PluginStatus = {
	action: string;
	pluginId: string;
	siteId: number;
	status: string;
	error: string;
};
