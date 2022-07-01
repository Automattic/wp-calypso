import { useSelector } from 'react-redux';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
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

	const preinstalledPremiumPluginFeature = preinstalledPremiumPlugin?.feature;

	const preinstalledPremiumPluginProduct =
		preinstalledPremiumPlugin?.products?.[ getPeriodVariationValue( billingPeriod ) ];

	return {
		isPreinstalledPremiumPlugin: !! preinstalledPremiumPlugin,
		isPreinstalledPremiumPluginUpgraded,
		preinstalledPremiumPluginFeature,
		preinstalledPremiumPluginProduct,
	};
}
