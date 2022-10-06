import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
} from 'calypso/lib/plugins/constants';
import {
	PLUGIN_INSTALLATION_COMPLETED,
	PLUGIN_INSTALLATION_ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import type { SiteDetails } from '@automattic/data-stores';
import type { MomentInput } from 'moment';
import type { ReactNode } from 'react';

export type Columns = Array< {
	key: string;
	header?: ReactNode;
	smallColumn?: boolean;
	colSpan?: number;
} >;

export type PluginSite = { [ key: string ]: { ID: number; canUpdateFiles: boolean } };

export interface Plugin {
	id: string;
	last_updated: MomentInput;
	sites: PluginSite;
	icon: string;
	name: string;
	pluginsOnSites: Array< any >;
	slug: string;
	wporg: boolean;
	[ key: string ]: any;
}

export type SiteWithPlugin = { site: SiteDetails; secondarySites: Array< object > | null };

export interface RowFormatterArgs {
	item: any;
	columnKey: string;
	isSmallScreen?: boolean;
	className?: string;
	selectedSite?: SiteDetails;
}
export interface PluginRowFormatterArgs extends RowFormatterArgs {
	item: Plugin;
}
export interface SiteRowFormatterArgs extends RowFormatterArgs {
	item: SiteDetails;
}

export type PluginActionTypes =
	| typeof ACTIVATE_PLUGIN
	| typeof DEACTIVATE_PLUGIN
	| typeof DISABLE_AUTOUPDATE_PLUGIN
	| typeof ENABLE_AUTOUPDATE_PLUGIN
	| typeof REMOVE_PLUGIN
	| typeof UPDATE_PLUGIN;

export type PluginActionStatus =
	| typeof PLUGIN_INSTALLATION_IN_PROGRESS
	| typeof PLUGIN_INSTALLATION_COMPLETED
	| typeof PLUGIN_INSTALLATION_ERROR;

export type CurrentSiteStatus = {
	action: PluginActionTypes;
	pluginId: string;
	siteId: string;
	status: PluginActionStatus;
};

export type PluginActionStatusMessage = {
	[ key in PluginActionTypes ]: {
		[ PLUGIN_INSTALLATION_IN_PROGRESS ]: ReactNode;
		[ PLUGIN_INSTALLATION_COMPLETED ]?: ReactNode;
		[ PLUGIN_INSTALLATION_ERROR ]: ReactNode;
	};
};
