import 'calypso/state/admin-menu/init';
import 'calypso/state/data-layer/wpcom/sites/admin-menu';
import { ADMIN_MENU_REQUEST, ADMIN_MENU_RECEIVE } from 'calypso/state/action-types';
import { requestLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import {
	getPluginOnSite,
	isRequesting as isRequestingPlugins,
} from 'calypso/state/plugins/installed/selectors';

export const requestAdminMenu = function requestAdminMenu( siteId ) {
	return {
		type: ADMIN_MENU_REQUEST,
		siteId,
	};
};

export const receiveAdminMenu = function receiveAdminMenu( siteId, menu ) {
	return {
		type: ADMIN_MENU_RECEIVE,
		siteId,
		menu,
	};
};

export const updateAdminMenuAfterPluginInstallation =
	( siteId, productSlug ) => ( dispatch, getState ) => {
		// Wait for the Atomic transfer to be completed...
		const { transfer } = getLatestAtomicTransfer( getState(), siteId );
		if ( transfer?.status !== 'completed' ) {
			// Poll the Atomic transfer status again.
			dispatch( requestLatestAtomicTransfer( siteId ) );

			// Check once more after 2s.
			setTimeout(
				() => dispatch( updateAdminMenuAfterPluginInstallation( siteId, productSlug ) ),
				2000
			);
			return;
		}

		// ...and for the plugin to be installed.
		const pluginOnSite = getPluginOnSite( getState(), siteId, productSlug );
		if ( ! pluginOnSite ) {
			// Poll the plugin installation status again.
			if ( ! isRequestingPlugins( getState(), siteId ) ) {
				dispatch( fetchSitePlugins( siteId ) );
			}

			// Check once more after 2s.
			setTimeout(
				() => dispatch( updateAdminMenuAfterPluginInstallation( siteId, productSlug ) ),
				2000
			);
			return;
		}

		dispatch( requestAdminMenu( siteId ) );
	};
