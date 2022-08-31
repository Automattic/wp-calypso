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
	wporg: string;
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
