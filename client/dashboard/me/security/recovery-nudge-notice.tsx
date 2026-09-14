import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import Notice from '../../components/notice';

function isVerifiedRedirect() {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	return new URLSearchParams( window.location.search ).get( 'verified' ) === '1';
}

function removeVerifiedParam() {
	const params = new URLSearchParams( window.location.search );
	params.delete( 'verified' );
	const newUrl = window.location.pathname + ( params.toString() ? '?' + params.toString() : '' );
	window.history.replaceState( {}, '', newUrl );
}

export default function RecoveryNudgeNotice() {
	const { recordTracksEvent } = useAnalytics();
	const [ isVisible, setIsVisible ] = useState( isVerifiedRedirect );
	const hasRecordedImpression = useRef( false );

	useEffect( () => {
		if ( ! isVisible || hasRecordedImpression.current ) {
			return;
		}
		hasRecordedImpression.current = true;
		recordTracksEvent( 'calypso_dashboard_security_recovery_notice_impression' );
		removeVerifiedParam();
	}, [ isVisible, recordTracksEvent ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Notice
			variant="success"
			title={ __( 'Email verified' ) }
			onClose={ () => {
				recordTracksEvent( 'calypso_dashboard_security_recovery_notice_dismiss' );
				setIsVisible( false );
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
