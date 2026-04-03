import { userSettingsQuery } from '@automattic/api-queries';
import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { hasEnabledAccountTools } from '../../../me/mcp/utils';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PreferencesAiMcp( { density }: { density?: Density } ) {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const isEnabled = hasEnabledAccountTools( userSettings || {} );

	const badges = [
		{
			text: isEnabled ? __( 'Enabled' ) : __( 'Disabled' ),
			intent: isEnabled ? ( 'success' as const ) : undefined,
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/mcp"
			title={ __( 'AI and MCP' ) }
			description={ __( 'Configure how AI agents access your WordPress.com data.' ) }
			decoration={ <BigSkyLogo.CentralLogo heartless size={ 24 } /> }
			badges={ badges }
		/>
	);
}
