import { sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import {
	AUTOMOMANAGED_PLUGINS,
	ECOMMERCE_BUNDLED_PLUGINS,
	PREINSTALLED_PLUGINS,
} from 'calypso/my-sites/plugins/constants';
import { useSelector } from 'calypso/state';
import { isSiteOnEcommerce } from 'calypso/state/sites/plans/selectors';
import type { PluginDetailsPlugin } from './plugin-details-CTA/types';
import type { SiteDetails } from '@automattic/data-stores';

interface PluginDetailsNoticesProps {
	selectedSite?: SiteDetails | null;
	plugin: PluginDetailsPlugin;
}

const PluginDetailsNotices = ( { selectedSite, plugin }: PluginDetailsNoticesProps ) => {
	const translate = useTranslate();
	const { data: purchases = [], isSuccess: hasLoadedSitePurchases } = useQuery( {
		...sitePurchasesQuery( selectedSite?.ID ?? 0 ),
		enabled: !! selectedSite?.ID,
	} );
	const isFullPluginAndPurchasesFetched = hasLoadedSitePurchases && plugin?.fetched;
	const isWpcomPreinstalled =
		PREINSTALLED_PLUGINS.includes( plugin.slug ) || AUTOMOMANAGED_PLUGINS.includes( plugin.slug );
	const isEcommercePlan = useSelector( ( state ) =>
		isSiteOnEcommerce( state, selectedSite?.ID ?? 0 )
	);
	const isBundledPlugin = isEcommercePlan
		? ECOMMERCE_BUNDLED_PLUGINS.includes( plugin.software_slug ?? '' )
		: false;
	const marketplacePluginHasSubscription = !! (
		plugin.isMarketplaceProduct && Boolean( getPluginPurchased( plugin, purchases ) )
	);

	if (
		! isFullPluginAndPurchasesFetched ||
		! plugin?.active ||
		marketplacePluginHasSubscription ||
		isWpcomPreinstalled ||
		isBundledPlugin ||
		! plugin.isMarketplaceProduct
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

export default PluginDetailsNotices;
