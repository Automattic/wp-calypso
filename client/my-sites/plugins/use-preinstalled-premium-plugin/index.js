import { useSelector } from 'react-redux';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { getPluginOnSite, getSitesWithPlugin } from 'calypso/state/plugins/installed/selectors';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { PREINSTALLED_PREMIUM_PLUGINS } from '../constants';
import { getPeriodVariationValue } from '../plugin-price';

export default function usePreinstalledPremiumPlugin( pluginSlug ) {
	const preinstalledPremiumPlugin = PREINSTALLED_PREMIUM_PLUGINS[ pluginSlug ];

	const selectedSiteId = useSelector( getSelectedSiteId );
	const billingPeriod = useSelector( getBillingInterval );

	const isPreinstalledPremiumPluginUpgraded = useSelector(
		( state ) =>
			!! preinstalledPremiumPlugin &&
			!! selectedSiteId &&
			siteHasFeature( state, selectedSiteId, preinstalledPremiumPlugin.feature )
	);

	const isPreinstalledPremiumPluginActive = useSelector( ( state ) => {
		if ( preinstalledPremiumPlugin && selectedSiteId ) {
			return true;
		}

		// Always active on simple sites
		if (
			! isSiteAutomatedTransfer( state, selectedSiteId ) &&
			! isJetpackSite( state, selectedSiteId )
		) {
			return true;
		}
		// Always active on atomic sites that don't have the plugin installed
		const pluginOnSite = getPluginOnSite( state, selectedSiteId, pluginSlug );
		if ( isSiteAutomatedTransfer( state, selectedSiteId ) && ! pluginOnSite ) {
			return true;
		}
		return isPluginActive( state, selectedSiteId, pluginSlug );
	} );

	const preinstalledPremiumPluginFeature = preinstalledPremiumPlugin?.feature;

	const preinstalledPremiumPluginProduct =
		preinstalledPremiumPlugin?.products?.[ getPeriodVariationValue( billingPeriod ) ];

	const sitesWithPreinstalledPremiumPlugin = useSelector( ( state ) => {
		if ( ! preinstalledPremiumPlugin ) {
			return 0;
		}
		if ( selectedSiteId ) {
			return Number( isPreinstalledPremiumPluginUpgraded );
		}

		const allSites = getSelectedOrAllSitesJetpackCanManage( state );
		const sitesWithPlugin = getSitesWithPlugin(
			state,
			siteObjectsToSiteIds( allSites ),
			pluginSlug
		);

		return sitesWithPlugin.length;
	} );

	return {
		isPreinstalledPremiumPlugin: !! preinstalledPremiumPlugin,
		isPreinstalledPremiumPluginActive,
		isPreinstalledPremiumPluginUpgraded,
		preinstalledPremiumPluginFeature,
		preinstalledPremiumPluginProduct,
		sitesWithPreinstalledPremiumPlugin,
	};
}
