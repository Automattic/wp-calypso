import type { ViewTable, ViewList, ViewPickerGrid } from '@wordpress/dataviews';

export type DomainsView = ViewTable | ViewList | ViewPickerGrid;

// Base properties that are common to all view types
const BASE_VIEW_PROPS = {
	type: 'table' as const,
	sort: {
		field: 'domain',
		direction: 'asc' as const,
	},
	perPage: 10,
	showMedia: false,
	titleField: 'domain',
	fields: [
		// 'owner',
		'blog_name',
		'ssl_status',
		'expiry',
		'domain_status',
	],
};

export const DEFAULT_VIEW = BASE_VIEW_PROPS;

export const SITE_CONTEXT_VIEW = {
	...BASE_VIEW_PROPS,
	fields: [ 'ssl_status', 'expiry', 'domain_status' ],
};

// Default layouts
export const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};
