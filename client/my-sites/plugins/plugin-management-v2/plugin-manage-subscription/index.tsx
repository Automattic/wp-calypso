import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import '../style.scss';

interface Props {
	site: SiteDetails;
	plugin: PluginComponentProps;
}

type Purchase = {
	id?: number;
};

export default function PluginManageSubcription( { site, plugin }: Props ): ReactElement | null {
	const translate = useTranslate();

	const purchases = useSelector( ( state ) => getSitePurchases( state, site.ID ) );
	const currentPurchase: Purchase = getPluginPurchased( plugin, purchases );

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
