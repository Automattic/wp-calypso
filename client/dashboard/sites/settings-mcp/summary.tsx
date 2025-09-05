import { isAutomatticianQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { SVG, Path } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

// Custom MCP icon component
const McpIcon = ( { style }: { style?: React.CSSProperties } ) => (
	<SVG width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={ style }>
		<title>ModelContextProtocol</title>
		<Path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z" />
		<Path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z" />
	</SVG>
);

export default function McpSettingsSummary( { site, density }: { site: Site; density?: Density } ) {
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	// Gate access to Automatticians only
	if ( ! isAutomattician ) {
		return null;
	}

	if ( ! siteSettings?.mcp_abilities ) {
		return null;
	}

	let badgeText: string;
	let badgeIntent: 'success' | 'info' | undefined;

	const enabledTools = Object.entries( siteSettings.mcp_abilities )
		.filter( ( [ , tool ] ) => tool.enabled )
		.map( ( [ toolId ] ) => toolId );

	const isMcpEnabled = enabledTools.length > 0;

	if ( ! isMcpEnabled ) {
		badgeText = __( 'Disabled' );
	} else {
		badgeText = sprintf(
			// translators: %d is the number of tools enabled
			_n( '%d Tool Enabled', '%d Tools Enabled', enabledTools.length ),
			enabledTools.length
		);
		badgeIntent = 'success';
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/mcp` }
			title={ __( 'MCP' ) + ' (' + __( 'A8C Only' ) + ')' }
			density={ density }
			decoration={ <McpIcon style={ { padding: '2px', boxSizing: 'border-box' } } /> }
			badges={ [
				{
					text: badgeText,
					intent: badgeIntent,
				},
			] }
		/>
	);
}
