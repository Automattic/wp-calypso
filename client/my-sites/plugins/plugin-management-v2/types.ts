import type { MomentInput } from 'moment';
import type { ReactChild } from 'react';

export type PluginColumns = Array< {
	key: string;
	title: ReactChild;
	smallColumn?: boolean;
	colSpan?: number;
} >;

export type PluginSite = { [ key: string ]: { ID: number; canUpdateFiles: boolean } };

export interface Plugin {
	id: number;
	last_updated: MomentInput;
	sites: PluginSite;
	icon: string;
	name: string;
	pluginsOnSites: Array< any >;
	slug: string;
	wporg: string;
}
