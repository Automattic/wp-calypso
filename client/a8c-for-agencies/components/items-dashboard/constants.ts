import { DataViewsState } from './items-dataviews/interfaces';

export const DATAVIEWS_TABLE = 'table';
export const DATAVIEWS_LIST = 'list';
//export const DATAVIEWS_GRID = 'grid';

export const initialDataViewsState: DataViewsState = {
	filters: [],
	sort: {
		field: '',
		direction: 'asc',
	},
	type: DATAVIEWS_TABLE,
	perPage: 50,
	page: 1,
	search: '',
	layout: {},
};
