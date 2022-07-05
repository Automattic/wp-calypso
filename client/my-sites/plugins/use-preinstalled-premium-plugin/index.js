import { useSelector } from 'react-redux';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
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
			siteHasFeature( state, selectedSiteId, preinstalledPremiumPlugin.feature )
	);

	const isPreinstalledPremiumPluginActive = useSelector( ( state ) => {
		if ( ! preinstalledPremiumPlugin ) {
			return false;
		}
		// Always active on simple sites
		if (
			! isSiteAutomatedTransfer( state, selectedSiteId ) &&
			! isJetpackSite( state, selectedSiteId )
		) {
			return true;
		}
		return isPluginActive( state, selectedSiteId, pluginSlug );
	} );

	const preinstalledPremiumPluginFeature = preinstalledPremiumPlugin?.feature;

	const preinstalledPremiumPluginProduct =
		preinstalledPremiumPlugin?.products?.[ getPeriodVariationValue( billingPeriod ) ];

	return {
		isPreinstalledPremiumPlugin: !! preinstalledPremiumPlugin,
		isPreinstalledPremiumPluginActive,
		isPreinstalledPremiumPluginUpgraded,
		preinstalledPremiumPluginFeature,
		preinstalledPremiumPluginProduct,
	};
}
