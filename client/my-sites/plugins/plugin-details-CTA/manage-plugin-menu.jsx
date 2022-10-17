import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const ManagePluginMenu = ( { plugin } ) => {
	const translate = useTranslate();

	const site = useSelector( getSelectedSite );
	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, site.ID, plugin.slug ) );

	const purchases = useSelector( ( state ) => getSitePurchases( state, site.ID ) );
	const currentPurchase =
		plugin.isMarketplaceProduct &&
		purchases.find( ( purchase ) =>
			Object.values( plugin?.variations ).some(
				( variation ) =>
					variation.product_slug === purchase.productSlug ||
					variation.product_id === purchase.productId
			)
		);
	const settingsLink = pluginOnSite?.action_links?.Settings ?? null;

	return (
		<>
			{ plugin.isMarketplaceProduct && <QueryUserPurchases /> }
			<EllipsisMenu position="bottom">
				{ currentPurchase?.id && (
					<PopoverMenuItem
						icon="credit-card"
						href={ `/me/purchases/${ site.domain }/${ currentPurchase.id }` }
					>
						{ translate( 'Manage Subscription' ) }
					</PopoverMenuItem>
				) }
				{ settingsLink && (
					<PopoverMenuItem icon="cog" href={ settingsLink }>
						{ translate( 'Settings' ) }
					</PopoverMenuItem>
				) }

				<PluginRemoveButton
					plugin={ pluginOnSite }
					site={ site }
					menuItem
					isMarketplaceProduct={ plugin.isMarketplaceProduct }
				/>
			</EllipsisMenu>
		</>
	);
};
