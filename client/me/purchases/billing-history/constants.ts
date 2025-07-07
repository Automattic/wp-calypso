import type { SortDirection, View } from '@wordpress/dataviews';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 10;

export const defaultSortField: string = 'date';
export const defaultSortDirection: SortDirection = 'desc';

export const wideFields = [ 'date', 'service', 'type', 'amount' ];
export const desktopFields = [ 'date', 'service' ];
export const mobileFields = [ 'service' ];

export const defaultDataViewsState: View = {
	type: 'table',
	search: '',
	filters: [],
	page: DEFAULT_PAGE,
	perPage: DEFAULT_PER_PAGE,
	sort: {
		field: defaultSortField,
		direction: defaultSortDirection,
	},
	fields: wideFields,
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
