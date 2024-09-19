import { tool, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_MARKETPLACE_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
	A4A_MARKETPLACE_HOSTING_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useMarketplaceMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: tool,
					path: A4A_MARKETPLACE_LINK,
					link: A4A_MARKETPLACE_HOSTING_LINK,
					title: translate( 'Hosting' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Marketplace / Hosting',
					},
				},
				path
			),
			createItem(
				{
					icon: plugins,
					path: A4A_MARKETPLACE_LINK,
					link: A4A_MARKETPLACE_PRODUCTS_LINK,
					title: translate( 'Products' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Marketplace / Products',
					},
				},
				path
			),
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate ] );
	return menuItems;
};

export default useMarketplaceMenuItems;
