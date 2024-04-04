import page from '@automattic/calypso-router';
import { category, chevronLeft, starEmpty, warning } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
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

	const noActiveSite = useNoActiveSite();

	const menuItems = useMemo( () => {
		if ( noActiveSite ) {
			// We hide the rest of the options when we do not have sites yet.
			return [
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
			];
		}

		return [
			createItem(
				{
					icon: warning,
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
	}, [ noActiveSite, path, translate ] );

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
