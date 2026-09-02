import { Button } from '@wordpress/components';
import { Substitution, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import useGetEmailToVerify from 'calypso/components/email-verification/hooks/use-get-email-to-verify';
import {
	formatCooldown,
	resendAcceptedRetryAfter,
	resendThrottleRetryAfter,
} from 'calypso/dashboard/utils/email-verification-resend';
import { useResendCooldown } from 'calypso/dashboard/utils/use-resend-cooldown';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import { fetchUserSettings, setUnsavedUserSetting } from 'calypso/state/user-settings/actions';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';

import './style.scss';

export default function EmailVerificationNotification( {
	isFullWidth,
}: {
	isFullWidth?: boolean;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const emailToVerify = useGetEmailToVerify();
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const sendVerificationEmail = useSendEmailVerification();
	const [ isSendingEmail, setIsSendingEmail ] = useState( false );

	// A4A does not mount QueryUserSettings anywhere, and useGetEmailToVerify reads
	// user_email from the user-settings store, so fetch them here or the banner never shows.
	useEffect( () => {
		dispatch( fetchUserSettings() );
	}, [ dispatch ] );

	const { secondsUntilResend, hold: holdResend } = useResendCooldown();
	// Rate limiting only applies to the dedicated resend endpoint, not the settings path used for pending email changes.
	const isAwaitingResend = ! isEmailChangePending && secondsUntilResend > 0;

	const resendEmailToVerify = useCallback( async () => {
		setIsSendingEmail( true );
		const genericError = translate(
			'There was an error while resending the email. Please try again.'
		);
		try {
			if ( isEmailChangePending ) {
				// For pending email changes, re-submit the new email via PUT /me/settings
				// since POST /me/send-verification-email only works for the original email.
				dispatch( setUnsavedUserSetting( 'user_email', emailToVerify ) );
				await dispatch( saveUnsavedUserSettings( [ 'user_email' ] ) );
			} else {
				// For unverified original emails, use the dedicated endpoint since
				// PUT /me/settings won't resend when the email hasn't changed.
				const response = await sendVerificationEmail();
				if ( ! response?.success ) {
					dispatch( errorNotice( genericError ) );
					return;
				}
				holdResend( resendAcceptedRetryAfter( response ) );
			}
			dispatch(
				successNotice(
					translate(
						'We sent an email to %(email)s. Please check your inbox to verify your email.',
						{ args: { email: emailToVerify as Substitution } }
					)
				)
			);
		} catch ( err ) {
			const retryAfter = resendThrottleRetryAfter( err );
			if ( retryAfter !== null ) {
				holdResend( retryAfter );
			}
			dispatch( errorNotice( err instanceof Error ? err.message : genericError ) );
		} finally {
			setIsSendingEmail( false );
		}
	}, [
		dispatch,
		emailToVerify,
		holdResend,
		isEmailChangePending,
		sendVerificationEmail,
		translate,
	] );

	if ( ! emailToVerify ) {
		return null;
	}

	const resendLabel = isAwaitingResend
		? translate( 'Resend email (%(countdown)s)', {
				args: { countdown: formatCooldown( secondsUntilResend ) },
				comment: 'countdown to when the verification email can be resent, e.g. 4:59',
		  } )
		: translate( 'Resend email' );

	return (
		<LayoutBanner
			isFullWidth={ isFullWidth }
			className="email-verification-notification"
			level="warning"
			title={ translate( 'Verify your email address' ) }
			actions={ [
				<Button
					key="resend"
					variant="primary"
					onClick={ resendEmailToVerify }
					disabled={ isAwaitingResend || isSendingEmail }
					isBusy={ isSendingEmail }
					__next40pxDefaultSize
				>
					{ resendLabel }
				</Button>,
			] }
			hideCloseButton
			allowTemporaryDismissal
			preferenceName="email-verification-notification-temporary-dismissed"
		>
			<div>
				{ translate(
					'Check your inbox at %(email)s for the confirmation email, or click \u201cResend email\u201d to get a new one.',
					{ args: { email: emailToVerify as Substitution } }
				) }
			</div>
		</LayoutBanner>
	);
}
