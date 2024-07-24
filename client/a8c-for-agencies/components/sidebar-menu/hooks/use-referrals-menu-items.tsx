import { category, cog, help } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/sections/referrals/common/step-section-item/status-badge';
import useGetTipaltiPayee from 'calypso/a8c-for-agencies/sections/referrals/hooks/use-get-tipalti-payee';
import { getAccountStatus } from 'calypso/a8c-for-agencies/sections/referrals/lib/get-account-status';
import {
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useReferralsMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const { data } = useGetTipaltiPayee();
	const accountStatus = getAccountStatus( data, translate );

	const showIndicator = accountStatus?.actionRequired;

	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: category,
					path: A4A_REFERRALS_LINK,
					link: A4A_REFERRALS_DASHBOARD,
					title: translate( 'Dashboard' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Referrals / Dashboard',
					},
				},
				path
			),
			createItem(
				{
					icon: cog,
					path: A4A_REFERRALS_LINK,
					link: A4A_REFERRALS_PAYMENT_SETTINGS,
					title: translate( 'Payment Settings' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Referrals / Payment Settings',
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
			createItem(
				{
					icon: help,
					path: A4A_REFERRALS_LINK,
					link: A4A_REFERRALS_FAQ,
					title: translate( 'FAQ' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Referrals / FAQ',
					},
				},
				path
			),
		]
			.map( ( item ) => createItem( item, path ) )
			.map( ( item ) => ( {
				...item,
				isSelected: item.link === path,
			} ) ); //FIXME: Fix this once we enable the automated referrals feature flag
	}, [ accountStatus, path, showIndicator, translate ] );
	return menuItems;
};

export default useReferralsMenuItems;
