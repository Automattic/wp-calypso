import type { MomentInput } from 'moment';

// The installed plugins found in the Redux store
export type InstalledPlugins = {
	[ key: string ]: InstalledPluginData[];
};

export type InstalledPluginData = {
	id: string;
	slug: string;
	active: boolean;
	name: string;
	plugin_url: string;
	version: string;
	description: string;
	author: string;
	author_url: string;
	network: boolean;
	autoupdate: boolean;
	uninstallable: boolean;
	update?: PluginUpdate;
};

// This is the plugin as it is exposed by the selectors
export type Plugin = {
	id: string;
	slug: string;
	last_updated: MomentInput;
	sites: PluginSites;
	icon: string;
	name: string;
	wporg?: boolean;
	statusRecentlyChanged?: boolean;
};

export type PluginSites = {
	[ key: string ]: {
		active: boolean;
		autoupdate: boolean;
		update?: PluginUpdate;
		version: string;
	};
};

export type PluginUpdate = {
	id: string;
	slug: string;
	new_version: string;
	url: string;
	package: string;
	tested: string;
	recentlyUpdated?: boolean;
};

export type PluginFilter = 'none' | 'all' | 'active' | 'inactive' | 'updates';

export type PluginStatus = {
	status: string;
};
