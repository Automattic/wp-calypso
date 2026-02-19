import { userSettingsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SVG, Path } from '@wordpress/primitives';
import { getAccountMcpAbilities } from '../../../me/mcp/utils';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

const bigSkyIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<g transform="translate(3.25, 3.25)">
			<Path d="M17.1294 8.2276L13.5386 6.98901C12.1186 6.50114 10.9989 5.38137 10.511 3.96136L9.2724 0.370643C9.1035 -0.123548 8.3965 -0.123548 8.2276 0.370643L6.98901 3.96136C6.50114 5.38137 5.38137 6.50114 3.96136 6.98901L0.370643 8.2276C-0.123548 8.3965 -0.123548 9.1035 0.370643 9.2724L3.96136 10.511C5.38137 10.9989 6.50114 12.1186 6.98901 13.5386L8.2276 17.1294C8.3965 17.6235 9.1035 17.6235 9.2724 17.1294L10.511 13.5386C10.9989 12.1186 12.1186 10.9989 13.5386 10.511L17.1294 9.2724C17.6235 9.1035 17.6235 8.3965 17.1294 8.2276ZM12.9381 9.0159L11.1428 9.6351C10.4296 9.8791 9.8729 10.4421 9.6289 11.149L9.0096 12.9444C8.922 13.1946 8.5718 13.1946 8.4841 12.9444L7.8649 11.149C7.6209 10.4359 7.0579 9.8791 6.35101 9.6351L4.55564 9.0159C4.30542 8.9283 4.30542 8.578 4.55564 8.4904L6.35101 7.8711C7.0641 7.6271 7.6209 7.0641 7.8649 6.35726L8.4841 4.5619C8.5718 4.31167 8.922 4.31167 9.0096 4.5619L9.6289 6.35726C9.8729 7.0704 10.4359 7.6271 11.1428 7.8711L12.9381 8.4904C13.1884 8.578 13.1884 8.9283 12.9381 9.0159Z" />
		</g>
	</SVG>
);

export default function McpSummary() {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	if ( ! isEnabled( 'mcp-settings' ) ) {
		return null;
	}

	const mcpAbilities = getAccountMcpAbilities( userSettings || {} );
	const anyToolsEnabled = Object.values( mcpAbilities ).some( ( tool: any ) => tool.enabled );

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: anyToolsEnabled ? __( 'Enabled' ) : __( 'Disabled' ),
			intent: anyToolsEnabled ? 'success' : 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/ai-and-mcp"
			title={ __( 'AI and MCP' ) }
			description={ __( 'Configure how AI assistants access your WordPress.com data.' ) }
			decoration={ <Icon icon={ bigSkyIcon } /> }
			badges={ badges }
		/>
	);
}
