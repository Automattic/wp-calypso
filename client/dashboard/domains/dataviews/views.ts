import type { View } from '@wordpress/dataviews';

// Base properties that are common to all view types
const BASE_VIEW_PROPS: View = {
	type: 'table',
	layout: {
		density: 'balanced',
		styles: {
			domain: { minWidth: '200px' },
			blog_name: { minWidth: '100px', maxWidth: '200px' },
			ssl_status: { maxWidth: '80px' },
			expiry: { minWidth: '150px', maxWidth: '200px' },
			domain_status: { minWidth: '100px', maxWidth: '200px' },
		},
	},
	sort: {
		field: 'domain',
		direction: 'asc',
	},
	perPage: 10,
	showLevels: false,
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
};
