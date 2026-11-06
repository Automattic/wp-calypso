import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useConsumeSearchParams } from '../../app/hooks/use-consume-search-params';
import Notice from '../../components/notice';

export default function RecoveryNudgeNotice() {
	const { recordTracksEvent } = useAnalytics();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { verified } = useConsumeSearchParams( [ 'verified' ], {
		when: ( params ) => params.verified === '1',
		onConsume: () => {
			setIsDismissed( false );
			recordTracksEvent( 'calypso_dashboard_security_recovery_notice_impression' );
		},
	} );

	if ( verified !== '1' || isDismissed ) {
		return null;
	}

	return (
		<Notice
			variant="success"
			title={ __( 'Email verified' ) }
			onClose={ () => {
				recordTracksEvent( 'calypso_dashboard_security_recovery_notice_dismiss' );
				setIsDismissed( true );
			} }
			actions={
				<Link
					to="/me/security/account-recovery"
					onClick={ () => recordTracksEvent( 'calypso_dashboard_security_recovery_notice_click' ) }
				>
					{ __( 'Set up account recovery' ) }
				</Link>
			}
		>
			{ __(
				'Help us help you recover your account if anything goes wrong. Set up at least one recovery option.'
			) }
		</Notice>
	);
}
