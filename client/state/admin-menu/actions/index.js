import 'calypso/state/admin-menu/init';
import 'calypso/state/data-layer/wpcom/sites/admin-menu';
import { ADMIN_MENU_REQUEST, ADMIN_MENU_RECEIVE } from 'calypso/state/action-types';
import { requestLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { getLatestAtomicTransfer } from 'calypso/state/atomic/transfers/selectors';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';

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
		const { transfer } = getLatestAtomicTransfer( getState(), siteId );
		const pluginOnSite = getPluginOnSite( getState(), siteId, productSlug );

		// Wait for the Atomic transfer to be completed...
		if ( transfer?.status !== 'completed' ) {
			// Check again after 2s.
			dispatch( requestLatestAtomicTransfer( siteId ) );
			setTimeout(
				() => dispatch( updateAdminMenuAfterPluginInstallation( siteId, productSlug ) ),
				2000
			);
			return;
		}

		// ...and for the plugin to be installed.
		if ( ! pluginOnSite ) {
			// Check again after 2s.
			dispatch( fetchSitePlugins( siteId ) );
			setTimeout(
				() => dispatch( updateAdminMenuAfterPluginInstallation( siteId, productSlug ) ),
				2000
			);
			return;
		}

		dispatch( requestAdminMenu( siteId ) );
	};
