import type { View } from '@wordpress/dataviews';

const DEFAULT_TABLE_FIELDS = [ 'sitesCount', 'updateAvailable' ];

export const defaultView: View = {
	type: 'table',
	perPage: 14,
	page: 1,
	search: '',
	filters: [],
	titleField: 'name',
	fields: DEFAULT_TABLE_FIELDS,
	sort: { field: 'name', direction: 'asc' },
};
