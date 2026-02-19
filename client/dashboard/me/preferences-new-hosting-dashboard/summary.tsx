import { userPreferenceQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { grid } from '@wordpress/icons';
import { useAuth } from '../../app/auth';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

const OLDEST_ELIGIBLE_USER: number = config( 'dashboard_opt_in_oldest_eligible_user' );

export default function PreferencesNewHostingDashboardSummary() {
	const { user } = useAuth();
	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'hosting-dashboard-opt-in' ) );

	// Only users created before 22 December 2025 can manually opt in or out.
	if ( user.ID > OLDEST_ELIGIBLE_USER ) {
		return null;
	}

	const isEnabled = optIn.value === 'opt-in';
	const badges: SummaryButtonBadgeProps[] = [
		{
			text: isEnabled ? __( 'Enabled' ) : __( 'Disabled' ),
			intent: isEnabled ? 'success' : 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/new-hosting-dashboard"
			title={ __( 'New hosting dashboard' ) }
			description={ __(
				'Opt in for a modern design and smarter tools for managing your hosting.'
			) }
			decoration={ <Icon icon={ grid } /> }
			badges={ badges }
		/>
	);
}
