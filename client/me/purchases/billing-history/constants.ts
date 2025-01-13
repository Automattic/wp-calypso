import type { ViewState } from './data-views-types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 10;

export const defaultDataViewsState: ViewState = {
	type: 'table',
	search: '',
	filters: [],
	page: DEFAULT_PAGE,
	perPage: DEFAULT_PER_PAGE,
	sort: {
		field: 'date',
		direction: 'desc',
	},
	fields: [ 'date', 'service', 'type', 'amount' ],
	hiddenFields: [],
	layout: {
		styles: {
			date: {
				width: '15%',
			},
			service: {
				width: '45%',
			},
			type: {
				width: '20%',
			},
			amount: {
				width: '20%',
			},
		},
	},
};
