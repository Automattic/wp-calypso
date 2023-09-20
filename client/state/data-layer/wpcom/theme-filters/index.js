import i18n from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	THEME_FILTERS_REQUEST,
	THEME_FILTERS_ADD,
	THEME_FILTERS_REQUEST_FAILURE,
} from 'calypso/state/themes/action-types';

const fetchFilters = ( action ) =>
	http(
		{
			method: 'GET',
			apiVersion: '1.2',
			path: '/theme-filters',
			query: action.locale ? { locale: action.locale } : {},
		},
		action
	);

const storeFilters = ( action, data ) => {
	return { type: THEME_FILTERS_ADD, filters: data };
};

// Note: the request handler will dispatch multiple actions if an array is returned.
const reportError = ( action, error ) => [
	{
		type: THEME_FILTERS_REQUEST_FAILURE,
		error,
	},
	errorNotice( i18n.translate( 'Problem fetching theme filters.' ) ),
];

const themeFiltersHandlers = dispatchRequest( {
	fetch: fetchFilters,
	onSuccess: storeFilters,
	onError: reportError,
} );

registerHandlers( 'state/data-layer/wpcom/theme-filters/index.js', {
	[ THEME_FILTERS_REQUEST ]: [
		( store, action ) => {
			return themeFiltersHandlers( store, action );
		},
	],
} );
