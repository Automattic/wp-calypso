import { category, cog, help } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useReferralsMenuItems = ( path: string ) => {
	const translate = useTranslate();
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
	}, [ path, translate ] );
	return menuItems;
};

export default useReferralsMenuItems;
