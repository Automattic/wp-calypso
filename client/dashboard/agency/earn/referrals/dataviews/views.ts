import type { SupportedLayouts, View } from '@wordpress/dataviews';

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {
		titleField: 'client',
	},
	list: {
		titleField: 'client',
	},
};

export const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 50,
	titleField: 'client',
	fields: [ 'completed-orders', 'pending-orders', 'estimated-commissions', 'subscription-status' ],
};
