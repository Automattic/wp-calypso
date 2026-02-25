import { category } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { A4A_LEARN_LINK, A4A_LEARN_RESOURCE_CENTER_LINK } from '../lib/constants';
import { createItem } from '../lib/utils';

const useLearnMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: category,
					path: A4A_LEARN_LINK,
					link: A4A_LEARN_RESOURCE_CENTER_LINK,
					title: translate( 'Learn' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Resource center / Learn',
					},
				},
				path
			),
		];
	}, [ path, translate ] );

	return menuItems;
};

export default useLearnMenuItems;
