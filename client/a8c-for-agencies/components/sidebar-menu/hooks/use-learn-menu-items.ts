import { pages, tool } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_DEV_TOOLS_LINK,
	A4A_LEARN_LINK,
	A4A_LEARN_RESOURCE_CENTER_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useLearnMenuItems = ( path: string ) => {
	const translate = useTranslate();

	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: pages,
					path: A4A_LEARN_LINK,
					link: A4A_LEARN_RESOURCE_CENTER_LINK,
					title: translate( 'Guides and articles' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Resources and tools / Guides and articles',
					},
				},
				path
			),
			createItem(
				{
					icon: tool,
					path: A4A_DEV_TOOLS_LINK,
					link: A4A_DEV_TOOLS_LINK,
					title: translate( 'Developer tools' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Resources and tools / Developer tools',
					},
				},
				path
			),
		];
	}, [ path, translate ] );

	return menuItems;
};

export default useLearnMenuItems;
