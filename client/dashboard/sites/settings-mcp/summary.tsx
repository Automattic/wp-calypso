import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { tool } from '@wordpress/icons';
import { siteSettingsQuery } from '../../app/queries/site-settings';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function McpSettingsSummary( { site, density }: { site: Site; density?: Density } ) {
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.ID ) );

	if ( ! siteSettings?.mcp_settings ) {
		return null;
	}

	const enabledAbilities = Object.entries( siteSettings.mcp_settings.mcp_abilities || {} )
		.filter( ( [ , enabled ] ) => enabled )
		.map( ( [ ability ] ) => ability );

	let badgeText: string;
	let badgeIntent: 'success' | 'info' | undefined;

	if ( ! siteSettings.mcp_settings.mcp_enabled ) {
		badgeText = __( 'MCP disabled' );
	} else if ( enabledAbilities.length === 0 ) {
		badgeText = __( 'No abilities enabled' );
	} else {
		// translators: %d is the number of abilities enabled
		badgeText = __( '%d abilities enabled', 'number of abilities' ).replace(
			'%d',
			enabledAbilities.length.toString()
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
