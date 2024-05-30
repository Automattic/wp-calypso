import { tool, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	PRODUCT_BRAND_FILTER_WOOCOMMERCE,
	PRODUCT_BRAND_FILTER_JETPACK,
	PRODUCT_BRAND_FILTER_ALL,
} from 'calypso/a8c-for-agencies/sections/marketplace/constants';
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
					secondaryLinks: [
						`${ A4A_MARKETPLACE_PRODUCTS_LINK }/${ PRODUCT_BRAND_FILTER_WOOCOMMERCE }`,
						`${ A4A_MARKETPLACE_PRODUCTS_LINK }/${ PRODUCT_BRAND_FILTER_JETPACK }`,
						`${ A4A_MARKETPLACE_PRODUCTS_LINK }/${ PRODUCT_BRAND_FILTER_ALL }`,
					],
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
