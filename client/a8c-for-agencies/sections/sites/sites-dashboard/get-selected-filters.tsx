import { Filter } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import { filtersMap } from '../constants';

export function getSelectedFilters( filters: Filter[] ) {
	return (
		filters?.map( ( filter ) => {
			const filterType =
				filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
				'all_issues';

			return filterType;
		} ) || []
	);
}
