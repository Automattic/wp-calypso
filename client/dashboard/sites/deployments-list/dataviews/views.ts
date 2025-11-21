import type { SortDirection, SupportedLayouts, View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: 20,
	fields: [ 'repository', 'commit', 'status', 'created_on' ],
	showLevels: false,
	sort: {
		field: 'created_on',
		direction: 'desc' as SortDirection,
	},
	layout: {
		density: 'balanced',
	},
};

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {},
};
