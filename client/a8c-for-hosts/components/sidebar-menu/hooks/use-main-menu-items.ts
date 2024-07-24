import { category, currencyDollar, home } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { createItem } from '../lib/utils';

const useMainMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const menuItems = useMemo( () => {
		return [
			{
				icon: home,
				path: '/wpcloud',
				link: '/wpcloud',
				title: translate( 'WP Cloud' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud',
				},
				withChevron: true,
			},
			{
				icon: category,
				path: '/jetpack',
				link: '/jetpack',
				title: translate( 'Jetpack' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / Jetpack',
				},
				withChevron: true,
			},
			{
				icon: currencyDollar,
				path: '/woocommerce',
				link: '/woocommerce',
				title: translate( 'WooCommerce' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WooCommerce',
				},
				withChevron: true,
			},
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate ] );
	return menuItems;
};

export default useMainMenuItems;
