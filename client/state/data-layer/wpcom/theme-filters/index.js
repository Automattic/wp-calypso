/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	THEME_FILTERS_REQUEST,
	THEME_FILTERS_ADD,
} from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';

const fetchFilters = ( { dispatch }, action ) => {
	dispatch( http( {
		method: 'GET',
		apiVersion: '1.2',
		path: '/theme-filters',
	}, action ) );
};

const storeFilters = ( { dispatch }, action, next, data ) =>
	dispatch( { type: THEME_FILTERS_ADD, filters: data } );

const reportError = ( { dispatch } ) =>
	dispatch( errorNotice( i18n.translate( 'Problem fetching theme filters.' ) ) );

export default {
	[ THEME_FILTERS_REQUEST ]: [ dispatchRequest( fetchFilters, storeFilters, reportError ) ],
};
