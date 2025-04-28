/**
 * Internal dependencies
 */
import { BaseDataViews } from './dataviews';
import DataViewsSearch from './dataviews-search';

type DataViewsProps = typeof BaseDataViews & {
	Search: typeof DataViewsSearch;
};

export const DataViews = BaseDataViews as DataViewsProps;

// Expose composable DataViews components
DataViews.Search = DataViewsSearch;
