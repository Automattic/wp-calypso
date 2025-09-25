import { accountRecoveryQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lifesaver } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function SecurityAccountRecoverySummary() {
	const { data: accountRecovery } = useSuspenseQuery( accountRecoveryQuery() );

	const { email, email_validated, phone, phone_validated } = accountRecovery;

	const badges: SummaryButtonBadgeProps[] = [];

	if ( email ) {
		badges.push( {
			text: email_validated ? __( 'Email added' ) : __( 'Email not validated' ),
			intent: email_validated ? 'success' : 'warning',
		} );
	} else {
		badges.push( {
			text: __( 'No recovery email' ),
			intent: 'warning',
		} );
	}

	if ( phone ) {
		badges.push( {
			text: phone_validated ? __( 'SMS number added' ) : __( 'SMS number not validated' ),
			intent: phone_validated ? 'success' : 'warning',
		} );
	} else {
		badges.push( {
			text: __( 'No recovery SMS number' ),
			intent: 'warning',
		} );
	}

	return (
		<RouterLinkSummaryButton
			to="/me/security/account-recovery"
			title={ __( 'Account recovery' ) }
			description={ __( 'Set up recovery email & SMS number' ) }
			decoration={ <Icon icon={ lifesaver } /> }
			badges={ badges }
		/>
	);
}
