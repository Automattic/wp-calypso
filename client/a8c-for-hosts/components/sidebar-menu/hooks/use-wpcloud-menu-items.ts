import { category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { createItem } from '../lib/utils';

const useWPCloudMenuItems = ( path: string ) => {
	const translate = useTranslate();

	return useMemo( () => {
		const items = [
			{
				icon: category,
				path: '/wpcloud',
				link: '/wpcloud',
				title: translate( 'Overview' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / Overview',
				},
			},
			{
				icon: category,
				path: '/wpcloud/inventory',
				link: '/wpcloud/inventory',
				title: translate( 'Inventory' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / Inventory',
				},
			},
			{
				icon: category,
				path: '/wpcloud/field-guide',
				link: '/wpcloud/field-guide',
				title: translate( 'Field Guide' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / Field Guide',
				},
			},
			{
				icon: category,
				path: '/wpcloud/api-documentation',
				link: '/wpcloud/api-documentation',
				title: translate( 'API Documentation' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / API Documentation',
				},
			},
			{
				icon: category,
				path: '/wpcloud/api-access',
				link: '/wpcloud/api-access',
				title: translate( 'API Access' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / API Access',
				},
			},
			{
				icon: category,
				path: '/wpcloud/insights',
				link: '/wpcloud/insights',
				title: translate( 'Insights' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / Insights',
				},
			},
			{
				icon: category,
				path: '/wpcloud/billing',
				link: '/wpcloud/billing',
				title: translate( 'Billing / Invoices' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / Billing',
				},
			},
			{
				icon: category,
				path: '/wpcloud/support',
				link: '/wpcloud/support',
				title: translate( 'Support Request' ),
				trackEventProps: {
					menu_item: 'Automattic for Hosts / WP Cloud / Support',
				},
			},
		].map( ( item ) => createItem( item, path ) );

		return items;
	}, [ path, translate ] );
};
export default useWPCloudMenuItems;
