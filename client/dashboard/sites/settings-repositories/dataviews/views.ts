import type { SortDirection, View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'list',
	perPage: 25,
	page: 1,
	sort: {
		field: 'updated_on',
		direction: 'desc' as SortDirection,
	},
	fields: [ 'owner', 'branch', 'target_dir', 'auto_deploy' ],
	titleField: 'repository',
};

export const DEFAULT_LAYOUTS = {
	list: {},
};
