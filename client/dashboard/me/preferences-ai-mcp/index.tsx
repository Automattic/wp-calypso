import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { hasEnabledAccountTools } from '../../../me/mcp/utils';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

const sparklesIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		width="24"
		height="24"
		fill="currentColor"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M6.24997 4L6.88636 5.61358L8.49994 6.24997L6.88636 6.88636L6.24997 8.49994L5.61358 6.88636L4 6.24997L5.61358 5.61358L6.24997 4Z" />
		<path d="M13 4L13.8485 6.15144L15.9999 6.99996L13.8485 7.84848L13 9.99992L12.1514 7.84848L10 6.99996L12.1514 6.15144L13 4Z" />
		<path d="M9.24995 8.49927L10.3106 11.1886L12.9999 12.2492L10.3106 13.3099L9.24995 15.9992L8.18931 13.3099L5.5 12.2492L8.18931 11.1886L9.24995 8.49927Z" />
	</svg>
);

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
			to="/me/mcp"
			title={ __( 'AI and MCP' ) }
			description={ __( 'Configure how AI agents access your WordPress.com data.' ) }
			decoration={ sparklesIcon }
			badges={ badges }
		/>
	);
}
