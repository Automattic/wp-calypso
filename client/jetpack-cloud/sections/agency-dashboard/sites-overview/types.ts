import type { ReactChild } from 'react';

// All types based on which the data is populated on the agency dashboard table rows
export type AllowedTypes = 'site' | 'backup' | 'scan' | 'monitor' | 'plugin';

// Site column object which holds key and title of each column
export type SiteColumns = Array< { key: string; title: ReactChild } >;

export interface SiteData {
	site: {
		value: { blog_id: number; url: string };
		error: string;
		type: AllowedTypes;
		status: string;
	};
	scan: { threats: number };
	plugin: { updates: number };
	[ key: string ]: any;
}
