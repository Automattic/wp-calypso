import { Dialog, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import PluginSiteList from 'calypso/my-sites/plugins/plugin-site-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getSiteObjectsWithPlugin } from 'calypso/state/plugins/installed/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';

export function ManageSitePluginsDialog( { isVisible, onClose, plugin } ) {
	const translate = useTranslate();

	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];

	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, plugin.slug )
	);

	return (
		<Dialog
			className="manage-site-plugins-dialog__container"
			isVisible={ isVisible }
			onClose={ onClose }
			shouldCloseOnEsc
		>
			<PluginSiteList
				className="manage-site-plugins-dialog__installed-on"
				title={ translate( 'Installed on %d site', 'Installed on %d sites', {
					comment: 'header for list of sites a plugin is installed on',
					args: [ sitesWithPlugin.length ],
					count: sitesWithPlugin.length,
				} ) }
				sites={ sitesWithPlugin }
				plugin={ plugin }
				showAdditionalHeaders
			/>

			<Button className="manage-site-plugins-dialog__finish-button" onClick={ onClose } primary>
				{ translate( 'Finished' ) }
			</Button>
		</Dialog>
	);
}
