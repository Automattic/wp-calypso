import { DataViewsState } from './items-dataviews/interfaces';

export const initialDataViewsState: DataViewsState = {
	type: 'table',
	perPage: 50,
	page: 1,
	sort: {
		field: 'site',
		direction: 'asc',
	},
	search: '',
	hiddenFields: [],
	layout: {},
};
