import { Badge } from '@automattic/components';
import {
	category,
	currencyDollar,
	home,
	moveTo,
	reusableBlock,
	tag,
	cog,
	commentAuthorAvatar,
	people,
	starEmpty,
	plugins,
	chartBar,
	box,
	pages,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { isPathAllowed } from 'calypso/a8c-for-agencies/lib/permission';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/sections/reports/constants';
import wooPaymentsIcon from 'calypso/assets/images/a8c-for-agencies/woopayments/woo-sidebar-icon.svg';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
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
	A4A_PLUGINS_LINK,
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_TEAM_LINK,
	A4A_AGENCY_TIER_LINK,
	A4A_MIGRATIONS_OVERVIEW_LINK,
	A4A_WOOPAYMENTS_LINK,
	A4A_LEARN_LINK,
	A4A_LEARN_RESOURCE_CENTER_LINK,
	A4A_EXCLUSIVE_OFFERS_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useMainMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const menuItems = useMemo( () => {
		let referralItems = [] as any[];

		if ( isSectionNameEnabled( 'a8c-for-agencies-referrals' ) ) {
			referralItems = [
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
			];
		}

		const migrationMenuItem = isSectionNameEnabled( 'a8c-for-agencies-migrations' )
			? {
					icon: moveTo,
					path: A4A_MIGRATIONS_LINK,
					link: A4A_MIGRATIONS_OVERVIEW_LINK,
					title: translate( 'Migrations' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Migrations',
					},
					withChevron: true,
			  }
			: {};

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
				icon: starEmpty,
				path: '/',
				link: A4A_AGENCY_TIER_LINK,
				title: translate( 'Agency tier' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Agency Tier',
				},
			},
			{
				icon: box,
				path: '/',
				link: A4A_EXCLUSIVE_OFFERS_LINK,
				title: translate( 'Exclusive offers' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Exclusive offers',
				},
			},
			...( isSectionNameEnabled( 'a8c-for-agencies-learn' )
				? [
						{
							icon: pages,
							path: A4A_LEARN_LINK,
							link: A4A_LEARN_RESOURCE_CENTER_LINK,
							title: translate( 'Learn' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Learn',
							},
							withChevron: true,
						},
				  ]
				: [] ),
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
			migrationMenuItem,
			{
				icon: <img src={ wooPaymentsIcon } alt="WooPayments" />,
				path: A4A_WOOPAYMENTS_LINK,
				link: A4A_WOOPAYMENTS_LINK,
				title: translate( 'WooPayments' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / WooPayments',
				},
				withChevron: true,
			},
			...( isSectionNameEnabled( 'a8c-for-agencies-plugins' )
				? [
						{
							icon: plugins,
							path: '/',
							link: A4A_PLUGINS_LINK,
							title: translate( 'Plugins' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Plugins',
							},
						},
				  ]
				: [] ),
			{
				icon: chartBar,
				path: A4A_REPORTS_LINK,
				link: A4A_REPORTS_LINK,
				title: (
					<div className="sidebar-menu-item__title-with-badge">
						<span>{ translate( 'Reports' ) }</span>
						<Badge type="info">{ translate( 'Beta' ) }</Badge>
					</div>
				),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Reports',
				},
				withChevron: true,
			},
			{
				icon: commentAuthorAvatar,
				path: '/dashboard',
				link: A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
				title: translate( 'Partner directories' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Partner Directory',
				},
				withChevron: true,
			},
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
			...( isSectionNameEnabled( 'a8c-for-agencies-team' )
				? [
						{
							icon: people,
							path: '/',
							link: A4A_TEAM_LINK,
							title: translate( 'Team' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Team',
							},
						},
				  ]
				: [] ),
		]
			.map( ( item ) => createItem( item, path ) )
			.filter( ( item ) => isPathAllowed( item.link, agency ) );
	}, [ agency, path, translate ] );
	return menuItems;
};

export default useMainMenuItems;
