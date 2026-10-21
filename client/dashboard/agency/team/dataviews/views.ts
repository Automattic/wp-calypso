import type { SupportedLayouts, View } from '@wordpress/dataviews';

export const DEFAULT_PER_PAGE = 25;

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {
		showMedia: false,
		titleField: 'name',
	},
};

// No default sort: the list preserves the order the endpoints return it in —
// active members from /users (agency owner first) followed by /user-invites.
export const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: DEFAULT_PER_PAGE,
	titleField: 'name',
	fields: [ 'role', 'status', 'added' ],
	filters: [],
};
