import { userPreferenceQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { grid } from '@wordpress/icons';
import { useAuth } from '../../app/auth';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isOptInToggleVisible } from '../../utils/hosting-dashboard-enrollment';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PreferencesNewHostingDashboard( { density }: { density?: Density } ) {
	const { user } = useAuth();
	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'hosting-dashboard-opt-in' ) );
	const isOptedIn = optIn.value === 'opt-in';

	if ( ! isOptInToggleVisible( optIn, user.ID ) ) {
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
