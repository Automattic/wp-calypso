import config from '@automattic/calypso-config';
import { category, currencyDollar, home, moveTo, reusableBlock, tag, cog } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import {
	A4A_MARKETPLACE_LINK,
	A4A_LICENSES_LINK,
	A4A_OVERVIEW_LINK,
	A4A_PURCHASES_LINK,
	A4A_REFERRALS_LINK,
	A4A_SITES_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
	A4A_MIGRATIONS_LINK,
	A4A_SETTINGS_LINK,
	A4A_REFERRALS_DASHBOARD,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useMainMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const menuItems = useMemo( () => {
		const isAutomatedReferralsEnabled = config.isEnabled( 'a4a-automated-referrals' );

		let referralItems = [] as any[];

		if ( isSectionNameEnabled( 'a8c-for-agencies-referrals' ) ) {
			referralItems = isAutomatedReferralsEnabled
				? [
						{
							icon: reusableBlock,
							path: A4A_REFERRALS_LINK,
							link: A4A_REFERRALS_DASHBOARD,
							title: translate( 'Referrals' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Referrals',
							},
							withChevron: true,
						},
				  ]
				: [
						{
							icon: reusableBlock,
							path: '/',
							link: A4A_REFERRALS_LINK,
							title: translate( 'Referrals' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Referrals',
							},
						},
				  ];
		}

		return [
			{
				icon: home,
				path: '/',
				link: A4A_OVERVIEW_LINK,
				title: translate( 'Overview' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Overview',
				},
			},
			{
				icon: category,
				path: '/',
				link: A4A_SITES_LINK,
				title: translate( 'Sites' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Dashboard',
				},
				withChevron: true,
			},
			/*
			// Hide this section until we support plugin management in A4A
			{
				icon: plugins,
				path: '/',
				link: A4A_PLUGINS_LINK,
				title: translate( 'Plugins' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Plugins',
				},
			},
			*/
			{
				icon: tag,
				path: A4A_MARKETPLACE_LINK,
				link: A4A_MARKETPLACE_HOSTING_LINK,
				title: translate( 'Marketplace' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Marketplace',
				},
				withChevron: true,
			},
			{
				icon: currencyDollar,
				path: A4A_PURCHASES_LINK,
				link: A4A_LICENSES_LINK,
				title: translate( 'Purchases' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Purchases',
				},
				withChevron: true,
			},
			...referralItems,
			...( isSectionNameEnabled( 'a8c-for-agencies-migrations' )
				? [
						{
							icon: moveTo,
							path: '/',
							link: A4A_MIGRATIONS_LINK,
							title: translate( 'Migrations' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Migrations',
							},
						},
				  ]
				: [] ),
			...( isSectionNameEnabled( 'a8c-for-agencies-settings' )
				? [
						{
							icon: cog,
							path: '/',
							link: A4A_SETTINGS_LINK,
							title: translate( 'Settings' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Settings',
							},
						},
				  ]
				: [] ),
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate ] );
	return menuItems;
};

export default useMainMenuItems;
