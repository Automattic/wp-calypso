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

export const updateAdminMenuAfterMarketplaceInstallation =
	( siteId, productSlug ) => ( dispatch, getState ) => {
		const { transfer } = getLatestAtomicTransfer( getState(), siteId );
		const pluginOnSite = getPluginOnSite( getState(), siteId, productSlug );

		// Wait for the Atomic transfer to be completed...
		if ( transfer?.status !== 'completed' ) {
			// Check again after 2s.
			dispatch( requestLatestAtomicTransfer( siteId ) );
			setTimeout(
				() => dispatch( updateAdminMenuAfterMarketplaceInstallation( siteId, productSlug ) ),
				2000
			);
			return;
		}

		// ...And for the plugin to be activated.
		if ( ! pluginOnSite ) {
			// Check again after 2s.
			dispatch( fetchSitePlugins( siteId ) );
			setTimeout(
				() => dispatch( updateAdminMenuAfterMarketplaceInstallation( siteId, productSlug ) ),
				2000
			);
			return;
		}

		// Wait for another 2s before updating the menu to allow the plugin to finish any potential setup.
		setTimeout( () => {
			dispatch( requestAdminMenu( siteId ) );
		}, 2000 );
	};
