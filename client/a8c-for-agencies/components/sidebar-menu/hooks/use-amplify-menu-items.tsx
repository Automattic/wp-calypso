import { home, chartBar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { A4A_AMPLIFY_LINK, A4A_AMPLIFY_REPORTS_LINK } from '../lib/constants';
import { createItem } from '../lib/utils';

const useAmplifyMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: home,
					path: A4A_AMPLIFY_LINK,
					link: A4A_AMPLIFY_LINK,
					title: translate( 'Overview' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Amplify / Overview',
					},
				},
				path
			),
			createItem(
				{
					icon: chartBar,
					path: A4A_AMPLIFY_LINK,
					link: A4A_AMPLIFY_REPORTS_LINK,
					title: translate( 'Reports' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Amplify / Reports',
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

export default useAmplifyMenuItems;
