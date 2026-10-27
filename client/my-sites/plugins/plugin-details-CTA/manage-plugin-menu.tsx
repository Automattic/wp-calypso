import { sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getPluginPurchased, getSoftwareSlug } from 'calypso/lib/plugins/utils';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import { useSelector } from 'calypso/state';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { PluginDetailsPlugin } from './types';

export const ManagePluginMenu = ( { plugin }: { plugin: PluginDetailsPlugin } ) => {
	const translate = useTranslate();

	const site = useSelector( getSelectedSite );
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, plugin.slug )
	);
	const softwareSlug = getSoftwareSlug( plugin, isMarketplaceProduct );
	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, site?.ID, softwareSlug ) );

	const { data: purchases = [] } = useQuery( {
		...sitePurchasesQuery( site?.ID ?? 0 ),
		enabled: !! site?.ID,
	} );
	const currentPurchase = getPluginPurchased( plugin, purchases );
	const settingsLink = pluginOnSite?.action_links?.Settings ?? null;

	if ( ! site ) {
		return null;
	}

	return (
		<>
			<EllipsisMenu position="bottom">
				{ currentPurchase?.ID && (
					<PopoverMenuItem
						icon="credit-card"
						href={ `/me/purchases/${ site.domain }/${ currentPurchase.ID }` }
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
