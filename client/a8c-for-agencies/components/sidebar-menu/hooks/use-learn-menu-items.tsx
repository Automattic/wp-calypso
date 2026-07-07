import { isEnabled } from '@automattic/calypso-config';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { brush, chartBar, pages, tool } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import {
	A4A_AGENT_STUDIO_LINK,
	A4A_AI_MCP_LINK,
	A4A_BENCHMARKS_LINK,
	A4A_DEV_TOOLS_LINK,
	A4A_LEARN_LINK,
	A4A_RESOURCES_LINK,
} from '../lib/constants';
import { createItem } from '../lib/utils';

const useLearnMenuItems = ( path: string ) => {
	const translate = useTranslate();
	const agency = useSelector( getActiveAgency );
	const isAgentStudioEnabled = isEnabled( 'a4a-agent-studio' );
	const isAiMcpEnabled = !! agency?.mcp?.allowed;
	const isBenchmarksEnabled = isEnabled( 'a4a-benchmarks' );

	const menuItems = useMemo( () => {
		return [
			...( isAgentStudioEnabled
				? [
						{
							icon: brush,
							path: A4A_AGENT_STUDIO_LINK,
							link: A4A_AGENT_STUDIO_LINK,
							title: translate( 'Agent studio' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Resources and tools / Agent studio',
							},
						},
				  ]
				: [] ),
			...( isBenchmarksEnabled
				? [
						{
							icon: chartBar,
							path: A4A_BENCHMARKS_LINK,
							link: A4A_BENCHMARKS_LINK,
							title: translate( 'Benchmarks' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Resources and tools / Benchmarks',
							},
						},
				  ]
				: [] ),
			...( isAiMcpEnabled
				? [
						{
							icon: <BigSkyLogo.CentralLogo heartless size={ 24 } />,
							path: A4A_AI_MCP_LINK,
							link: A4A_AI_MCP_LINK,
							title: translate( 'AI and MCP' ),
							badge: translate( 'Beta' ),
							trackEventProps: {
								menu_item: 'Automattic for Agencies / Resources and tools / AI and MCP',
							},
						},
				  ]
				: [] ),
			{
				icon: tool,
				path: A4A_DEV_TOOLS_LINK,
				link: A4A_DEV_TOOLS_LINK,
				title: translate( 'Developer tools' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Resources and tools / Developer tools',
				},
			},
			{
				icon: pages,
				path: A4A_RESOURCES_LINK,
				link: A4A_LEARN_LINK,
				title: translate( 'Learn' ),
				trackEventProps: {
					menu_item: 'Automattic for Agencies / Resources and tools / Learn',
				},
			},
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate, isAgentStudioEnabled, isAiMcpEnabled, isBenchmarksEnabled ] );

	return menuItems;
};

export default useLearnMenuItems;
