import type { View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'list',
	perPage: 20,
	sort: {
		field: 'updated_on',
		direction: 'desc',
	},
	fields: [ 'owner', 'branch', 'target_dir', 'auto_deploy' ],
	titleField: 'repository',
	layout: {
		density: 'balanced',
	},
	showLevels: false,
};

export const DEFAULT_LAYOUTS = {
	list: {},
};
