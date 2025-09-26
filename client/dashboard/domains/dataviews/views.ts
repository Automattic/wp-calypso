import type { ViewTable, ViewList, ViewPickerGrid } from '@wordpress/dataviews';

export type DomainsView = ViewTable | ViewList | ViewPickerGrid;

// Base properties that are common to all view types
const BASE_VIEW_PROPS = {
	filters: [] as any[],
	sort: {
		field: 'domain',
		direction: 'asc' as const,
	},
	page: 1,
	perPage: 10,
	search: '',
	showMedia: false,
	titleField: 'domain',
	// descriptionField: 'domain_type',
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
	fields: [ 'type', 'ssl_status', 'expiry', 'domain_status' ],
};

// Default layouts
export const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};
