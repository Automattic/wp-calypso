import type { SortDirection, SupportedLayouts, View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: 20,
	sort: {
		field: 'created_on',
		direction: 'desc' as SortDirection,
	},
	fields: [ 'repository', 'commit', 'status', 'created_on' ],
	layout: {
		density: 'balanced',
	},
};

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {
		titleField: 'repository',
	},
};
