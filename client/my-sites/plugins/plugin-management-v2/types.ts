import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
	UPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import {
	PLUGIN_INSTALLATION_INCOMPLETED,
	PLUGIN_INSTALLATION_COMPLETED,
	PLUGIN_INSTALLATION_ERROR,
	PLUGIN_INSTALLATION_IN_PROGRESS,
} from 'calypso/state/plugins/installed/status/constants';
import type { SiteDetails } from '@automattic/data-stores';
import type { Plugin } from 'calypso/state/plugins/installed/types';
import type { ReactNode } from 'react';

export type Columns = Array< {
	key: string;
	header?: ReactNode;
	smallColumn?: boolean;
	colSpan?: number;
} >;

export type SiteWithPlugin = { site: SiteDetails; secondarySites: Array< object > | null };

export interface RowFormatterArgs {
	item: any;
	columnKey: string;
	isSmallScreen?: boolean;
	className?: string;
	selectedSite?: SiteDetails;
}
export interface PluginRowFormatterArgs extends RowFormatterArgs {
	item: PluginComponentProps;
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
	| typeof UPDATE_PLUGIN
	| typeof INSTALL_PLUGIN;

export type PluginActionStatus =
	| typeof PLUGIN_INSTALLATION_IN_PROGRESS
	| typeof PLUGIN_INSTALLATION_COMPLETED
	| typeof PLUGIN_INSTALLATION_ERROR
	| typeof PLUGIN_INSTALLATION_INCOMPLETED;

export type CurrentSiteStatus = {
	action: PluginActionTypes;
	pluginId: string;
	siteId: string;
	status: PluginActionStatus;
};

// Some component code adds properties onto the plugin objects and then passes that to other components.
// This type is used to account for that behavior.
export type PluginComponentProps = Plugin & {
	isSelectable?: boolean;
	isSelected?: boolean;
	isMarketplaceProduct?: boolean;
	onClick?: () => void;
};
