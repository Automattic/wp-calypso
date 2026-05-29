import { userPreferenceQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { grid } from '@wordpress/icons';
import { useAuth } from '../../app/auth';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

const OLDEST_ELIGIBLE_USER: number = config( 'dashboard_opt_in_oldest_eligible_user' );

export default function PreferencesNewHostingDashboard( { density }: { density?: Density } ) {
	const { user } = useAuth();
	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'hosting-dashboard-opt-in' ) );
	const isOptedIn = optIn.value === 'opt-in';

	// Only users created before 22 December 2025 can manually opt in or out.
	if ( user.ID > OLDEST_ELIGIBLE_USER ) {
		return null;
	}

	const badges = [
		{
			text: isOptedIn ? __( 'Enabled' ) : __( 'Disabled' ),
			intent: isOptedIn ? ( 'success' as const ) : undefined,
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/hosting-dashboard"
			title={ __( 'New hosting dashboard' ) }
			description={ __(
				'Opt in for a modern design and smarter tools for managing your hosting.'
			) }
			decoration={ <Icon icon={ grid } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
