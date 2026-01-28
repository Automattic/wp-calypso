import type { View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: 20,
	sort: {
		field: 'published',
		direction: 'desc',
	},
	fields: [ 'published', 'event', 'actor' ],
	layout: {
		density: 'balanced',
		styles: {
			published: { maxWidth: '300px', minWidth: '175px' },
			published_utc: { maxWidth: '200px', minWidth: '175px' },
			actor: { maxWidth: '150px', minWidth: '75px' },
			event: { minWidth: '500px' },
		},
	},
	showLevels: false,
};
