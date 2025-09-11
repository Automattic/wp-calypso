import type { ViewTable, ViewList } from '@wordpress/dataviews';

export type DomainsView = ViewTable | ViewList;

export const DEFAULT_VIEW: Partial< DomainsView > = {
	filters: [],
	sort: {
		field: 'domain',
		direction: 'asc',
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

export const SITE_CONTEXT_VIEW: Partial< DomainsView > = {
	...DEFAULT_VIEW,
	fields: [ 'type', 'ssl_status', 'expiry', 'domain_status' ],
};

// Default layouts
export const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};
