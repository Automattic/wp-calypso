import type { SortDirection, SupportedLayouts, View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	layout: {
		density: 'balanced',
	},
	perPage: 20,
	sort: {
		field: 'created_on',
		direction: 'desc' as SortDirection,
	},
	fields: [ 'commit', 'status', 'created_on' ],
	titleField: 'repository',
};

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {},
};
