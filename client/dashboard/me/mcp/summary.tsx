import { userSettingsQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SVG, Path } from '@wordpress/primitives';
import { getAccountMcpAbilities } from '../../../me/mcp/utils';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

const sparkles = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
		<g clipPath="url(#clip0_4469_1573)">
			<Path d="M6.24997 4L6.88636 5.61358L8.49994 6.24997L6.88636 6.88636L6.24997 8.49994L5.61358 6.88636L4 6.24997L5.61358 5.61358L6.24997 4Z" />
			<Path d="M13 4L13.8485 6.15144L15.9999 6.99996L13.8485 7.84848L13 9.99992L12.1514 7.84848L10 6.99996L12.1514 6.15144L13 4Z" />
			<Path d="M9.24995 8.49927L10.3106 11.1886L12.9999 12.2492L10.3106 13.3099L9.24995 15.9992L8.18931 13.3099L5.5 12.2492L8.18931 11.1886L9.24995 8.49927Z" />
		</g>
		<defs>
			<clipPath id="clip0_4469_1573">
				<rect width="11.9999" height="11.9998" fill="white" transform="translate(4 4)" />
			</clipPath>
		</defs>
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
			decoration={ <Icon icon={ sparkles } /> }
			badges={ badges }
		/>
	);
}
