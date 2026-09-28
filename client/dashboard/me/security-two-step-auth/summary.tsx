import { userSettingsQuery } from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { mobile } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useAuth } from '../../app/auth';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import DashboardSummaryButton from '../../components/summary-button';
import type {
	Density,
	SummaryButtonBadgeProps,
} from '@automattic/components/src/summary-button/types';

export default function SecurityTwoStepAuthSummary( { density }: { density?: Density } ) {
	const { user } = useAuth();
	const isEmailVerified = user?.email_verified;

	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );

	const { two_step_enabled, two_step_backup_codes_printed } = userSettings;

	// The API masks `two_step_enabled` to false inside support sessions so no 2FA challenge is
	// enforced or sent for the supported user, which would make this read "Not enabled" for
	// accounts that have two-step on.
	const { createErrorNotice } = useDispatch( noticesStore );
	if ( isSupportSession() ) {
		return (
			<DashboardSummaryButton
				density={ density }
				onClick={ () => {
					createErrorNotice(
						__(
							'Two-step authentication status is not available during a support session. Use the User Report Card for the full configuration.'
						),
						{ type: 'snackbar' }
					);
				} }
				title={ __( 'Two-step authentication' ) }
				decoration={ <Icon icon={ mobile } /> }
				badges={ [
					{ text: __( 'Not available during a support session' ), intent: 'informational' },
				] }
			/>
		);
	}

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: two_step_enabled ? __( 'Enabled' ) : __( 'Not enabled' ),
			intent: two_step_enabled ? 'stable' : 'medium',
		},
	];

	if ( two_step_enabled && ! two_step_backup_codes_printed ) {
		badges.push( {
			text: __( 'Backup codes not printed' ),
			intent: 'medium',
		} );
	}

	return (
		<RouterLinkSummaryButton
			density={ density }
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
