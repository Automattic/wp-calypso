import type { View } from '@wordpress/dataviews';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 10;

export const defaultSortField: string = 'date';

export const defaultDataViewsState: View = {
	type: 'table',
	search: '',
	filters: [],
	page: DEFAULT_PAGE,
	perPage: DEFAULT_PER_PAGE,
	sort: {
		field: defaultSortField,
		direction: 'desc',
	},
	fields: [ 'date', 'service', 'type', 'amount' ],
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
