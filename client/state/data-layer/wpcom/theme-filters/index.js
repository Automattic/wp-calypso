/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { THEME_FILTERS_REQUEST, THEME_FILTERS_ADD } from 'calypso/state/themes/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import isSiteEligibleForFullSiteEditing from 'calypso/state/selectors/is-site-eligible-for-full-site-editing';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

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
			const isFse = isSiteEligibleForFullSiteEditing( state, selectedSiteId );

			return themeFiltersHandlers( store, {
				...action,
				isFse,
			} );
		},
	],
} );
