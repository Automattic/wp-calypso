import page from '@automattic/calypso-router';
import { category, chevronLeft, formatListBulletsRTL, starEmpty } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Sidebar from '../sidebar';
import {
	A4A_OVERVIEW_LINK,
	A4A_SITES_LINK,
	A4A_SITES_LINK_FAVORITE,
	A4A_SITES_LINK_NEEDS_ATTENTION,
} from './lib/constants';
import { createItem } from './lib/utils';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();

	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: formatListBulletsRTL,
					path: A4A_SITES_LINK,
					link: A4A_SITES_LINK_NEEDS_ATTENTION,
					title: translate( 'Needs Attention' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Sites / Needs Attention',
					},
				},
				path
			),
			createItem(
				{
					icon: starEmpty,
					path: A4A_SITES_LINK,
					link: A4A_SITES_LINK_FAVORITE,
					title: translate( 'Favorites' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Sites / Favorites',
					},
				},
				path
			),
			createItem(
				{
					id: 'sites-all-menu-item',
					icon: category,
					path: A4A_SITES_LINK,
					link: A4A_SITES_LINK,
					title: translate( 'All' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Sites / All',
					},
				},
				path
			),
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate ] );

	return (
		<Sidebar
			path={ A4A_SITES_LINK }
			title={ translate( 'Sites' ) }
			description={ translate( 'Manage all your sites and Jetpack services from one place.' ) }
			backButtonProps={ {
				label: translate( 'Back to overview' ),
				icon: chevronLeft,
				onClick: () => {
					page( A4A_OVERVIEW_LINK );
				},
			} }
			menuItems={ menuItems }
			withSiteSelector
			withGetHelpLink
		/>
	);
}
