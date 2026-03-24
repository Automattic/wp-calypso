import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { connection } from '@wordpress/icons';
import { hasEnabledAccountTools } from '../../../me/mcp/utils';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function PreferencesAiMcp() {
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
			to="/me/preferences/mcp"
			title={ __( 'AI and MCP' ) }
			description={ __( 'Configure how AI agents access your WordPress.com data.' ) }
			decoration={ <Icon icon={ connection } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
