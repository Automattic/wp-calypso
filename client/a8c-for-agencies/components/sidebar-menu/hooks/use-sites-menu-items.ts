import { category, starEmpty, warning } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
import {
	A4A_SITES_LINK,
	A4A_SITES_LINK_FAVORITE,
	A4A_SITES_LINK_NEEDS_ATTENTION,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useSitesMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const noActiveSite = useNoActiveSite();

	return useMemo( () => {
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
};

export default useSitesMenuItems;
