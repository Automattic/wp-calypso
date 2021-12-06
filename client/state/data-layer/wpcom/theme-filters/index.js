import i18n from 'i18n-calypso';
import { omit } from 'lodash';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import isSiteEligibleForLegacyFSE from 'calypso/state/selectors/is-site-eligible-for-legacy-fse';
import isSiteUsingCoreSiteEditor from 'calypso/state/selectors/is-site-using-core-site-editor.js';
import { THEME_FILTERS_REQUEST, THEME_FILTERS_ADD } from 'calypso/state/themes/action-types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
	let filters = action.isFse ? data : omit( data, 'feature.full-site-editing' );
	filters = action.isCoreFse ? filters : omit( filters, 'feature.block-templates' );
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
			const isFse = isSiteEligibleForLegacyFSE( state, selectedSiteId );
			const isCoreFse = isSiteUsingCoreSiteEditor( state, selectedSiteId );

			return themeFiltersHandlers( store, {
				...action,
				isFse,
				isCoreFse,
			} );
		},
	],
} );
