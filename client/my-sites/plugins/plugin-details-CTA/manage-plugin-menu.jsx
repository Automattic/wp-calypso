import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getPluginPurchased, getSoftwareSlug } from 'calypso/lib/plugins/utils';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const ManagePluginMenu = ( { plugin } ) => {
	const translate = useTranslate();

	const site = useSelector( getSelectedSite );
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const softwareSlug = getSoftwareSlug( plugin, isMarketplaceProduct );
	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, site.ID, softwareSlug ) );

	const purchases = useSelector( ( state ) => getSitePurchases( state, site.ID ) );
	const currentPurchase = getPluginPurchased( plugin, purchases );
	const settingsLink = pluginOnSite?.action_links?.Settings ?? null;

	return (
		<>
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
					productPurchase={ currentPurchase }
				/>
			</EllipsisMenu>
		</>
	);
};
