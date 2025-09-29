import { userSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { mobile } from '@wordpress/icons';
import { useAuth } from '../../app/auth';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function SecurityTwoStepAuthSummary() {
	const { user } = useAuth();
	const isEmailVerified = user?.email_verified;

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const { two_step_enabled, two_step_backup_codes_printed } = userSettings;

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: two_step_enabled ? __( 'Enabled' ) : __( 'Not enabled' ),
			intent: two_step_enabled ? 'success' : 'warning',
		},
	];

	if ( two_step_enabled && ! two_step_backup_codes_printed ) {
		badges.push( {
			text: __( 'Backup codes not printed' ),
			intent: 'warning',
		} );
	}

	return (
		<RouterLinkSummaryButton
			disabled={ ! isEmailVerified }
			to="/me/security/two-step-auth"
			title={ __( 'Two-step authentication' ) }
			description={
				isEmailVerified
					? __( 'Manage two-step authentication and security keys and backup codes.' )
					: __( 'Please verify your email address to enable two-step authentication.' )
			}
			decoration={ <Icon icon={ mobile } /> }
			badges={ isEmailVerified ? badges : [] }
		/>
	);
}
