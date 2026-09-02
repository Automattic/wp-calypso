import { __ } from '@wordpress/i18n';
import { chartBar, home } from '@wordpress/icons';
import { useMemo } from 'react';
import { A4A_AMPLIFY_LINK, A4A_AMPLIFY_REPORTS_LINK } from '../lib/constants';
import { createItem } from '../lib/utils';

const useAmplifyMenuItems = ( path: string ) => {
	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: home,
					path: A4A_AMPLIFY_LINK,
					link: A4A_AMPLIFY_LINK,
					title: __( 'Overview' ),
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
					title: __( 'Reports' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Amplify / Reports',
					},
				},
				path
			),
		].map( ( item ) => ( {
			...item,
			isSelected: item.link === path,
		} ) );
	}, [ path ] );

	return menuItems;
};

export default useAmplifyMenuItems;
