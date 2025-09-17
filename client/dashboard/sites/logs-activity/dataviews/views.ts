import { useState } from '@wordpress/element';
import type { View } from '@wordpress/dataviews';

const activityLogsViewConfig = {
	sortField: 'published',
	titleField: '',
	primaryField: 'event',
	visibleFields: [ 'published', 'event', 'actor' ],
	layout: {
		styles: {
			published: { maxWidth: '175px', minWidth: '140px' },
			published_utc: { maxWidth: '175px', minWidth: '140px' },
			actor: { maxWidth: '150px', minWidth: '75px' },
		},
	},
};

export function useActivityView( {
	initialFilters,
}: {
	initialFilters?: View[ 'filters' ];
} = {} ) {
	return useState< View >( () => ( {
		type: 'table',
		page: 1,
		perPage: 20,
		sort: {
			field: activityLogsViewConfig.sortField,
			direction: 'desc',
		},
		filters: initialFilters ?? [],
		titleField: activityLogsViewConfig.titleField,
		primaryField: activityLogsViewConfig.primaryField,
		fields: activityLogsViewConfig.visibleFields,
		layout: activityLogsViewConfig.layout,
	} ) );
}
