import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function PrivacySummary() {
	const { data: userSettings } = useQuery( userSettingsQuery() );
	const isSharingEnabled = userSettings ? ! userSettings.tracks_opt_out : true;

	const badges: SummaryButtonBadgeProps[] = [
		isSharingEnabled
			? { text: __( 'Sharing usage information' ), intent: 'success' }
			: { text: __( 'Usage information sharing disabled' ), intent: 'default' },
	];

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/privacy"
			title={ __( 'Privacy' ) }
			description={ __( 'Manage your privacy settings and data usage preferences.' ) }
			decoration={ <Icon icon={ seen } /> }
			badges={ badges }
		/>
	);
}
