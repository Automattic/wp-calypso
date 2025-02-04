import { filtersMap } from '../constants';
import type { Filter } from '@wordpress/dataviews';

export function getSelectedFilters( filters: Filter[] = [] ) {
	return (
		filters?.map( ( filter ) => {
			const filterType =
				filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
				'all_issues';

			return filterType;
		} ) || []
	);
}
