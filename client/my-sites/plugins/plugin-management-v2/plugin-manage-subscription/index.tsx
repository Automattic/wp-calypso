import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
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
	const currentPurchase = getPluginPurchased( plugin, purchases, plugin.isMarketplaceProduct );

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
