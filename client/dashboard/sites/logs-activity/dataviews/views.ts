import { useState } from '@wordpress/element';
import type { View } from '@wordpress/dataviews';

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
			field: 'published',
			direction: 'desc',
		},
		filters: initialFilters ?? [],
		titleField: '',
		primaryField: 'event',
		fields: [ 'published', 'event', 'actor' ],
		layout: {
			styles: {
				published: { maxWidth: '175px', minWidth: '140px' },
				published_utc: { maxWidth: '175px', minWidth: '140px' },
				actor: { maxWidth: '150px', minWidth: '75px' },
			},
		},
	} ) );
}
