import type { View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	layout: {
		density: 'balanced',
	},
	perPage: 10,
	sort: { field: 'emailAddress', direction: 'asc' },
	fields: [ 'domainName', 'type', 'status' ],
	titleField: 'emailAddress',
	showLevels: false,
};
