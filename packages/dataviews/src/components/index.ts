/**
 * Internal dependencies
 */
import { DataViews as DataViewsRoot } from './dataviews';
import DataViewsSearch from './dataviews-search';

type DataViewsProps = typeof DataViewsRoot & {
	Search: typeof DataViewsSearch;
};

const DataViews = DataViewsRoot as DataViewsProps;

export default DataViews;
