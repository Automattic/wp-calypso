/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { THEME_FILTERS_REQUEST, THEME_FILTERS_ADD } from 'state/themes/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

const fetchFilters = ( action ) =>
	http(
		{
			method: 'GET',
			apiVersion: '1.2',
			path: '/theme-filters',
		},
		action
	);

const storeFilters = ( action, data ) => ( { type: THEME_FILTERS_ADD, filters: data } );

const reportError = () => errorNotice( i18n.translate( 'Problem fetching theme filters.' ) );

registerHandlers( 'state/data-layer/wpcom/theme-filters/index.js', {
	[ THEME_FILTERS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchFilters,
			onSuccess: storeFilters,
			onError: reportError,
		} ),
	],
} );
