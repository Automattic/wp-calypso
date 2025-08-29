import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { isAutomatticianQuery } from '../../app/queries/me-a8c';
import { siteSettingsQuery } from '../../app/queries/site-settings';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

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

	const enabledAbilities = Object.entries( siteSettings.mcp_abilities )
		.filter( ( [ , ability ] ) => ability.enabled )
		.map( ( [ abilityId ] ) => abilityId );

	const isMcpEnabled = enabledAbilities.length > 0;

	if ( ! isMcpEnabled ) {
		badgeText = __( 'MCP Access Disabled' );
	} else {
		badgeText = sprintf(
			// translators: %d is the number of abilities enabled
			__( '%d MCP Abilities Enabled' ),
			enabledAbilities.length
		);
		badgeIntent = 'success';
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/mcp` }
			title={ __( 'Model Context Protocol (MCP)' ) }
			density={ density }
			decoration={ <Icon icon={ tool } /> }
			badges={ [
				{
					text: badgeText,
					intent: badgeIntent,
				},
			] }
		/>
	);
}
