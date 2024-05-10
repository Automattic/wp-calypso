import { DataViewsFilter } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { filtersMap } from '../constants';

export function getSelectedFilters( filters: DataViewsFilter[] = [] ) {
	const statusFilter = filters
		.filter( ( filter: DataViewsFilter ) => filter.field === 'status' )
		.map( ( filter: DataViewsFilter ) => {
			const filterType =
				filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
				'all_issues';
			return filterType;
		} );

	const siteTagsFilter = filters
		.filter( ( filter: DataViewsFilter ) => filter.field === 'site_tags' )
		.map( ( filter: DataViewsFilter ) => {
			const filterType =
				[
					{ value: 'game', label: 'Game' },
					{ value: 'retro', label: 'Retro' },
					{ value: 'some', label: 'Some' },
					{ value: 'tags', label: 'Tags' },
				].find( ( tagFilter ) => {
					return tagFilter.value === filter.value;
				} )?.value || '';

			return filterType;
		} );

	return {
		status: statusFilter,
		siteTags: siteTagsFilter,
	};
}
