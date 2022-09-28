import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import '../style.scss';

interface Props {
	site: SiteDetails;
	plugin: Plugin;
}

export default function PluginManageSubcription( { site, plugin }: Props ): ReactElement | null {
	const translate = useTranslate();

	const purchases = useSelector( ( state ) => getSitePurchases( state, site.ID ) );

	const currentPurchase =
		plugin.isMarketplaceProduct &&
		purchases.find( ( purchase ) =>
			Object.values( plugin?.variations ).some(
				( variation: any ) =>
					variation.product_slug === purchase.productSlug ||
					variation.product_id === purchase.productId
			)
		);

	return currentPurchase?.id ? (
		<>
			<PopoverMenuItem
				className="plugin-management-v2__actions"
				icon="credit-card"
				href={ `/me/purchases/${ site.domain }/${ currentPurchase.id }` }
			>
				{ translate( 'Manage Subscription' ) }
			</PopoverMenuItem>
		</>
	) : null;
}
