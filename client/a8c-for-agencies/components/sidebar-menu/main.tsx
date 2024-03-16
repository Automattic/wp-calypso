import { category, home, plugins, tag, currencyDollar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Sidebar from '../sidebar';
import {
	A4A_OVERVIEW_LINK,
	A4A_PLUGINS_LINK,
	A4A_SITES_LINK,
	A4A_MARKETPLACE_LINK,
	A4A_PURCHASES_LINK,
	A4A_LICENSES_LINK,
	A4A_MARKETPLACE_PRODUCTS_LINK,
} from './lib/constants';
import { createItem } from './lib/utils';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useMemo( () => {
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
			{
				icon: plugins,
				path: '/',
				link: A4A_PLUGINS_LINK,
				title: translate( 'Plugins' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Plugins',
				},
			},
			{
				icon: tag,
				path: A4A_MARKETPLACE_LINK,
				link: A4A_MARKETPLACE_PRODUCTS_LINK,
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
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate ] );

	return <Sidebar path="" menuItems={ menuItems } withUserProfileFooter />;
}
