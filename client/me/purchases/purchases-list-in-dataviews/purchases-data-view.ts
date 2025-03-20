import { View } from '@wordpress/dataviews';

export const purchasesDataView = {
	type: 'table',
	page: 1,
	perPage: 5,
	sort: {
		field: 'product_id',
		direction: 'desc',
	},
	titleField: 'site',
	fields: [],
	layout: {},
} as View;
