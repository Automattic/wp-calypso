import type { View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	layout: {},
	sort: {
		field: 'timestamp',
		direction: 'desc',
	},
	perPage: 10,
	fields: [ 'site', 'mode', 'status', 'score', 'timestamp' ],
};

export const DEFAULT_LAYOUTS = { table: {} };
