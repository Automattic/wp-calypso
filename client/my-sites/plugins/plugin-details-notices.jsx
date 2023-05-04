import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import {
	AUTOMOMANAGED_PLUGINS,
	BUNDLED_PLUGINS_BY_PLAN,
	PREINSTALLED_PLUGINS,
} from 'calypso/my-sites/plugins/constants';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
} from 'calypso/state/purchases/selectors';

const PluginDetailsNotices = ( { selectedSite, plugin, translate } ) => {
	const hasLoadedSitePurchases = useSelector( hasLoadedSitePurchasesFromServer );
	const isFullPluginAndPurchasesFetched = hasLoadedSitePurchases && plugin?.fetched;
	const isWpcomPreinstalled =
		PREINSTALLED_PLUGINS.includes( plugin.slug ) || AUTOMOMANAGED_PLUGINS.includes( plugin.slug );
	const isBundledPlugin = BUNDLED_PLUGINS_BY_PLAN[ selectedSite?.plan?.product_slug ]?.includes(
		plugin.software_slug
	);
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const marketplacePluginHasSubscription = !! (
		plugin.isMarketplaceProduct && getPluginPurchased( plugin, purchases )?.active
	);

	if (
		! isFullPluginAndPurchasesFetched ||
		! plugin?.active ||
		marketplacePluginHasSubscription ||
		isWpcomPreinstalled ||
		isBundledPlugin
	) {
		return null;
	}

	return (
		<Notice
			icon="notice"
			showDismiss={ false }
			status="is-warning"
			text={ translate(
				'Plugin subscription not found or you have purchased the plugin outside of WordPress.com. Purchase a WordPress.com subscription if you want to receive updates and support.',
				{
					textOnly: true,
				}
			) }
		></Notice>
	);
};

PluginDetailsNotices.propTypes = {
	selectedSite: PropTypes.object.isRequired,
	plugin: PropTypes.object.isRequired,
};

export default localize( PluginDetailsNotices );
