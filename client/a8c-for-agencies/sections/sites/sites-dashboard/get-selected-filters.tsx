import { DataViewsFilter } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { filtersMap } from '../constants';

export function getSelectedFilters( filters: DataViewsFilter[] = [] ) {
	return (
		filters?.map( ( filter ) => {
			const filterType =
				filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
				'all_issues';

			return filterType;
		} ) || []
	);
}
