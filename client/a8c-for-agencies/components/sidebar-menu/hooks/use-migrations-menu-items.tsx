import { category, cog, currencyDollar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import useGetTipaltiPayee from 'calypso/a8c-for-agencies/sections/referrals/hooks/use-get-tipalti-payee';
import { getAccountStatus } from 'calypso/a8c-for-agencies/sections/referrals/lib/get-account-status';
import {
	A4A_MIGRATIONS_LINK,
	A4A_MIGRATIONS_OVERVIEW_LINK,
	A4A_MIGRATIONS_COMMISSIONS_LINK,
	A4A_MIGRATIONS_PAYMENT_SETTINGS,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useMigrationsMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const { data } = useGetTipaltiPayee();
	const accountStatus = getAccountStatus( data, translate );

	const showIndicator = accountStatus?.actionRequired;

	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: category,
					path: A4A_MIGRATIONS_LINK,
					link: A4A_MIGRATIONS_OVERVIEW_LINK,
					title: translate( 'Overview' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Migrations / Overview',
					},
				},
				path
			),
			createItem(
				{
					icon: currencyDollar,
					path: A4A_MIGRATIONS_LINK,
					link: A4A_MIGRATIONS_COMMISSIONS_LINK,
					title: translate( 'Commissions' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Migrations / Commissions',
					},
				},
				path
			),
			createItem(
				{
					icon: cog,
					path: A4A_MIGRATIONS_LINK,
					link: A4A_MIGRATIONS_PAYMENT_SETTINGS,
					title: translate( 'Payout Settings' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Migrations / Payment Settings',
					},
					...( showIndicator && {
						extraContent: (
							<StatusBadge
								statusProps={ {
									children: 1,
									type: accountStatus.statusType,
									isRounded: true,
									tooltip: accountStatus.statusReason,
								} }
							/>
						),
					} ),
				},
				path
			),
		]
			.map( ( item ) => createItem( item, path ) )
			.map( ( item ) => ( {
				...item,
				isSelected: item.link === path,
			} ) );
	}, [ accountStatus, path, showIndicator, translate ] );
	return menuItems;
};

export default useMigrationsMenuItems;
