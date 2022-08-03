import type { MomentInput } from 'moment';
import type { ReactChild } from 'react';

export type PluginColumns = Array< {
	key: string;
	title: ReactChild;
	smallColumn?: boolean;
	colSpan?: number;
} >;

export type PluginSite = { ID: string | number; canUpdateFiles: any };

export interface Plugin {
	id: number;
	last_updated: MomentInput;
	sites: Array< PluginSite >;
	icon: string;
	name: string;
	pluginsOnSites: Array< any >;
	slug: string;
	wporg: string;
}
