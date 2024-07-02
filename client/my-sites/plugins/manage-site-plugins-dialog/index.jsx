import { Dialog, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getSiteObjectsWithPlugin } from 'calypso/state/plugins/installed/selectors';
import { isFetching as isWporgPluginFetchingSelector } from 'calypso/state/plugins/wporg/selectors';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import './style.scss';
import PluginAvailableOnSitesList from '../plugin-management-v2/plugin-details-v2/plugin-available-on-sites-list';
import SitesWithInstalledPluginsList from '../plugin-management-v2/plugin-details-v2/sites-with-installed-plugin-list';

export const ManageSitePluginsDialog = ( { isVisible, onClose, plugin } ) => {
	const translate = useTranslate();

	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];

	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, plugin.slug )
	);

	const sites = useSelector( getSelectedOrAllSites );
	sites.sort( orderByAtomic );
	const sitesWithoutPlugin = sites.filter(
		( site ) => ! sitesWithPlugin.find( ( siteWithPlugin ) => siteWithPlugin.ID === site.ID )
	);

	const isLoading = useSelector( ( state ) => isWporgPluginFetchingSelector( state, plugin.slug ) );

	return (
		<>
			{ isVisible && (
				<Dialog
					className="manage-site-plugins-dialog__container"
					isVisible={ isVisible }
					onClose={ onClose }
					shouldCloseOnEsc
				>
					<SitesWithInstalledPluginsList
						isWpCom
						sites={ sitesWithPlugin }
						isLoading={ isLoading }
						plugin={ plugin }
					/>

					<PluginAvailableOnSitesList
						sites={ sitesWithoutPlugin }
						isLoading={ isLoading }
						plugin={ plugin }
					/>
					<Button className="manage-site-plugins-dialog__finish-button" onClick={ onClose } primary>
						{ translate( 'Close' ) }
					</Button>
				</Dialog>
			) }
		</>
	);
};

function orderByAtomic( siteA, siteB ) {
	const { is_wpcom_atomic: siteAAtomic } = siteA?.options ?? {};
	const { is_wpcom_atomic: siteBAtomic } = siteB?.options ?? {};

	if ( siteAAtomic === siteBAtomic ) {
		return 0;
	}

	if ( siteAAtomic && ! siteBAtomic ) {
		return -1;
	}

	return 1;
}
