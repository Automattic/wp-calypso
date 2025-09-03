import type { SortDirection, View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: 25,
	page: 1,
	sort: {
		field: 'created_on',
		direction: 'desc' as SortDirection,
	},
	search: '',
	filters: [],
	fields: [ 'repository_name', 'commit', 'status', 'created_on' ],
	layout: {},
};

export const DEFAULT_LAYOUTS = {
	table: {
		titleField: 'repository_name',
	},
};
