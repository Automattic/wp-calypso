import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { MomentInput } from 'moment';
import type { ReactChild } from 'react';

export type Columns = Array< {
	key: string;
	title?: ReactChild;
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
	wporg: string;
	[ key: string ]: any;
}

export type SiteWithPlugin = { site: SiteData; secondarySites: Array< object > | null };

export interface RowFormatterArgs {
	item: any;
	columnKey: string;
	isSmallScreen?: boolean;
	className?: string;
	selectedSite?: SiteData;
}

export interface PluginRowFormatterArgs extends RowFormatterArgs {
	item: Plugin;
}

export interface SiteRowFormatterArgs extends RowFormatterArgs {
	item: SiteData;
}
