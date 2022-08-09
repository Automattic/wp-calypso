import { FEATURE_INSTALL_PLUGINS } from '@automattic/calypso-products';
import { Dialog, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import PluginSiteList from 'calypso/my-sites/plugins/plugin-site-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import {
	getSiteObjectsWithPlugin,
	getSiteObjectsWithoutPlugin,
} from 'calypso/state/plugins/installed/selectors';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import './style.scss';

export const ManageSitePluginsDialog = ( { isVisible, onClose, plugin } ) => {
	const translate = useTranslate();

	const billingPeriod = useSelector( getBillingInterval );

	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];

	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, plugin.slug )
	);
	const sitesWithoutPlugin = useSelector( ( state ) =>
		getSiteObjectsWithoutPlugin( state, siteIds, plugin.slug )
	);

	const availableOnSites = useSelector( ( state ) =>
		sitesWithoutPlugin.filter( ( site ) =>
			siteHasFeature( state, site.ID, FEATURE_INSTALL_PLUGINS )
		)
	);
	const upgradeNeededSites = useSelector( ( state ) =>
		sitesWithoutPlugin.filter(
			( site ) => ! siteHasFeature( state, site.ID, FEATURE_INSTALL_PLUGINS )
		)
	);

	return (
		<Dialog
			className="manage-site-plugins-dialog__container"
			isVisible={ isVisible }
			onClose={ onClose }
			shouldCloseOnEsc
		>
			<PluginSiteList
				className="manage-site-plugins-dialog__plugin-list"
				title={ translate( 'Installed on %d site', 'Installed on %d sites', {
					comment: 'header for list of sites a plugin is installed on',
					args: [ sitesWithPlugin.length ],
					count: sitesWithPlugin.length,
				} ) }
				sites={ sitesWithPlugin }
				plugin={ plugin }
				showAdditionalHeaders
			/>

			<PluginSiteList
				className="manage-site-plugins-dialog__plugin-list"
				title={ translate( 'Available sites' ) }
				sites={ availableOnSites }
				plugin={ plugin }
				billingPeriod={ billingPeriod }
			/>

			<PluginSiteList
				className="manage-site-plugins-dialog__plugin-list"
				title={ translate( 'Upgrade needed' ) }
				sites={ upgradeNeededSites }
				plugin={ plugin }
				billingPeriod={ billingPeriod }
			/>

			<Button className="manage-site-plugins-dialog__finish-button" onClick={ onClose } primary>
				{ translate( 'Close' ) }
			</Button>
		</Dialog>
	);
};
