import { View } from '@wordpress/dataviews';

// This DataView configuration will continue to be updated
// This is the basic version, as we pull more columns out from the PurchaseItem component it will be expanded
export const purchasesDataView = {
	type: 'table',
	page: 1,
	perPage: 5,
	sort: {
		field: 'site',
		direction: 'desc',
	},
	titleField: 'site',
	fields: [],
	layout: {},
} as View;
