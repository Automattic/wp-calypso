import { isEnabled } from '@automattic/calypso-config';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { pages, tool } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	A4A_AI_MCP_LINK,
	A4A_DEV_TOOLS_LINK,
	A4A_LEARN_LINK,
	A4A_RESOURCES_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useLearnMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const isAiMcpEnabled = isEnabled( 'a4a-ai-mcp' );

	const menuItems = useMemo( () => {
		const items = [
			createItem(
				{
					icon: pages,
					path: A4A_RESOURCES_LINK,
					link: A4A_LEARN_LINK,
					title: translate( 'Learn' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Resources and tools / Learn',
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

		if ( isAiMcpEnabled ) {
			items.push(
				createItem(
					{
						icon: <BigSkyLogo.CentralLogo heartless size={ 24 } />,
						path: A4A_AI_MCP_LINK,
						link: A4A_AI_MCP_LINK,
						title: translate( 'AI and MCP' ),
						trackEventProps: {
							menu_item: 'Automattic for Agencies / Resources and tools / AI and MCP',
						},
					},
					path
				)
			);
		}

		return items;
	}, [ path, translate, isAiMcpEnabled ] );

	return menuItems;
};

export default useLearnMenuItems;
