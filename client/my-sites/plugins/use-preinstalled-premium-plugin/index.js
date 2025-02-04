import { isJetpackSearchFree, isJetpackSearch } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { getSitesWithPlugin } from 'calypso/state/plugins/installed/selectors';
import { isPluginActive } from 'calypso/state/plugins/installed/selectors-ts';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackModuleActive, isJetpackSite } from 'calypso/state/sites/selectors';
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
		if ( ! preinstalledPremiumPlugin || ! selectedSiteId ) {
			return false;
		}

		// Always active on simple sites
		if (
			! isSiteAutomatedTransfer( state, selectedSiteId ) &&
			! isJetpackSite( state, selectedSiteId )
		) {
			return true;
		}

		// If the preinstalled premium plugin is also a Jetpack module, check if it's enabled.
		if (
			preinstalledPremiumPlugin.jetpack_module &&
			isJetpackSite( state, selectedSiteId ) &&
			isJetpackModuleActive( state, selectedSiteId, preinstalledPremiumPlugin.jetpack_module )
		) {
			return true;
		}

		return isPluginActive( state, selectedSiteId, pluginSlug );
	} );

	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );
	const hasPurchasedFree = sitePurchases.some( isJetpackSearchFree );
	const hasPurchasedPaid = sitePurchases.some( isJetpackSearch );

	// Does the preinstalled premium plugin have a free tier?
	const hasPreinstalledPremiumPluginFreeTier = !! preinstalledPremiumPlugin?.products?.free;

	// Is the site using the free tier of a preinstalled premium plugin?
	const isPreinstalledPremiumPluginFreeInstalled =
		hasPreinstalledPremiumPluginFreeTier && isPreinstalledPremiumPluginUpgraded && hasPurchasedFree;

	const isPreinstalledPremiumPluginPaidInstalled =
		isPreinstalledPremiumPluginUpgraded && hasPurchasedPaid;

	// If the site is using the free tier, offer the paid product
	const preinstalledPremiumPluginProduct = isPreinstalledPremiumPluginFreeInstalled
		? preinstalledPremiumPlugin?.products?.[ getPeriodVariationValue( billingPeriod ) ]
		: preinstalledPremiumPlugin?.products?.free;

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
		preinstalledPremiumPluginProduct,
		sitesWithPreinstalledPremiumPlugin,
		isPreinstalledPremiumPluginFreeInstalled,
		isPreinstalledPremiumPluginPaidInstalled,
	};
}
