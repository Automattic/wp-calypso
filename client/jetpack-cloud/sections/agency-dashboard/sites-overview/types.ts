import type { ReactChild } from 'react';

// All types based on which the data is populated on the agency dashboard table rows
export type AllowedTypes = 'site' | 'backup' | 'scan' | 'monitor' | 'plugin';

// Site column object which holds key and title of each column
export type SiteColumns = Array< { key: string; title: ReactChild } >;

export interface SiteNode {
	value: { blog_id: number; url: string; url_with_scheme: string };
	error: string;
	type: AllowedTypes;
	status: string;
}
export interface SiteData {
	site: SiteNode;
	scan: { threats: number };
	plugin: { updates: number };
	[ key: string ]: any;
}
