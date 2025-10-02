import { useState } from '@wordpress/element';
import type { View } from '@wordpress/dataviews';

export function useActivityView( {
	initialFilters,
	initialSearch,
}: {
	initialFilters?: View[ 'filters' ];
	initialSearch?: string;
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
				published: { maxWidth: '300px', minWidth: '175px' },
				published_utc: { maxWidth: '200px', minWidth: '175px' },
				actor: { maxWidth: '150px', minWidth: '75px' },
				event: { minWidth: '500px' },
			},
		},
		search: initialSearch ?? undefined,
	} ) );
}
