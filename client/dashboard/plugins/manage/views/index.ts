import type { View } from '@wordpress/dataviews';

const DEFAULT_TABLE_FIELDS = [ 'sitesCount', 'updateAvailable' ];

export const defaultView: View = {
	type: 'table',
	layout: {
		density: 'balanced',
	},
	perPage: 14,
	showLevels: false,
	showMedia: false,
	titleField: 'name',
	fields: DEFAULT_TABLE_FIELDS,
	sort: { field: 'name', direction: 'asc' },
};
