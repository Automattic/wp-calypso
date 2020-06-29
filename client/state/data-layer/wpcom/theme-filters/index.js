/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { THEME_FILTERS_REQUEST, THEME_FILTERS_ADD } from 'state/themes/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';

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

const storeFilters = ( action, data ) => {
	const filters = action.isFse ? data : omit( data, 'feature.full-site-editing' );
	return { type: THEME_FILTERS_ADD, filters };
};

const reportError = () => errorNotice( i18n.translate( 'Problem fetching theme filters.' ) );

const themeFiltersHandlers = dispatchRequest( {
	fetch: fetchFilters,
	onSuccess: storeFilters,
	onError: reportError,
} );

registerHandlers( 'state/data-layer/wpcom/theme-filters/index.js', {
	[ THEME_FILTERS_REQUEST ]: [
		( store, action ) => {
			const state = store.getState();
			const selectedSiteId = getSelectedSiteId( state );
			const isFse = isSiteUsingFullSiteEditing( state, selectedSiteId );

			return themeFiltersHandlers( store, {
				...action,
				isFse,
			} );
		},
	],
} );
