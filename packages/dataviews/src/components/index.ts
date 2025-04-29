/**
 * Internal dependencies
 */
import { DataViewsRoot } from './dataviews';
import DataViewsSearch from './dataviews-search';

type DataViewsProps = typeof DataViewsRoot & {
	Search: typeof DataViewsSearch;
};

export const DataViews = DataViewsRoot as DataViewsProps;

// Expose composable DataViews components
DataViews.Search = DataViewsSearch;
