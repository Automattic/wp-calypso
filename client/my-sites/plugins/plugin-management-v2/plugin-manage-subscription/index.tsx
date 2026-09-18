import { sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getPluginPurchased } from 'calypso/lib/plugins/utils';
import type { PluginComponentProps } from '../types';
import type { Purchase } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';
import type { PluginPeriodVariations } from 'calypso/data/marketplace/types';
import type { ReactElement } from 'react';

import '../style.scss';

interface Props {
	site: SiteDetails;
	plugin: PluginComponentProps & { variations?: PluginPeriodVariations };
}

export default function PluginManageSubcription( { site, plugin }: Props ): ReactElement | null {
	const translate = useTranslate();

	const { data: purchases = [] } = useQuery( {
		...sitePurchasesQuery( site.ID ),
		enabled: !! site.ID,
	} );
	const currentPurchase: Purchase | undefined = getPluginPurchased( plugin, purchases );

	return currentPurchase?.ID ? (
		<>
			<PopoverMenuItem
				className="plugin-management-v2__actions"
				icon="credit-card"
				href={ `/me/purchases/${ site.domain }/${ currentPurchase.ID }` }
			>
				{ translate( 'Manage Subscription' ) }
			</PopoverMenuItem>
		</>
	) : null;
}
