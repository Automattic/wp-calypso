import { home, category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_REPORTS_LINK,
	A4A_REPORTS_OVERVIEW_LINK,
	A4A_REPORTS_DASHBOARD_LINK,
} from 'calypso/a8c-for-agencies/sections/reports/constants';
import { createItem } from '../lib/utils';

const useReportsMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: home,
					path: A4A_REPORTS_LINK,
					link: A4A_REPORTS_OVERVIEW_LINK,
					title: translate( 'Overview' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Reports / Overview',
					},
				},
				path
			),
			createItem(
				{
					icon: category,
					path: A4A_REPORTS_LINK,
					link: A4A_REPORTS_DASHBOARD_LINK,
					title: translate( 'Dashboard' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Reports / Dashboard',
					},
				},
				path
			),
		]
			.map( ( item ) => createItem( item, path ) )
			.map( ( item ) => ( {
				...item,
				isSelected: item.link === path,
			} ) );
	}, [ path, translate ] );
	return menuItems;
};

export default useReportsMenuItems;
