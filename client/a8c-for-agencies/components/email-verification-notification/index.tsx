import { Button, VisuallyHidden } from '@wordpress/components';
import { Substitution, useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { EXTERNAL_WPCOM_ACCOUNT_URL } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
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
import { fetchUserSettings } from 'calypso/state/user-settings/actions';

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
	const isAwaitingResend = secondsUntilResend > 0;

	const resendEmailToVerify = useCallback( async () => {
		setIsSendingEmail( true );
		const genericError = translate(
			'There was an error while resending the email. Please try again.'
		);
		try {
			const response = await sendVerificationEmail();
			if ( ! response?.success ) {
				dispatch( errorNotice( genericError ) );
				return;
			}
			holdResend( resendAcceptedRetryAfter( response ) );
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
	}, [ dispatch, emailToVerify, holdResend, sendVerificationEmail, translate ] );

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
				// Resending to a pending address re-saves it, which WordPress.com only accepts from
				// its own clients, so that resend happens there.
				isEmailChangePending ? (
					<Button
						key="resend"
						variant="primary"
						href={ EXTERNAL_WPCOM_ACCOUNT_URL }
						target="_blank"
						rel="noopener noreferrer"
						__next40pxDefaultSize
					>
						<span>
							{ translate( 'Resend email' ) } <span aria-hidden="true">↗</span>
						</span>
						<VisuallyHidden>{ translate( '(opens in a new tab)' ) }</VisuallyHidden>
					</Button>
				) : (
					<Button
						key="resend"
						variant="primary"
						onClick={ resendEmailToVerify }
						disabled={ isAwaitingResend || isSendingEmail }
						isBusy={ isSendingEmail }
						__next40pxDefaultSize
					>
						{ resendLabel }
					</Button>
				),
			] }
			hideCloseButton
			allowTemporaryDismissal
			preferenceName="email-verification-notification-temporary-dismissed"
		>
			<div className="email-verification-notification__content">
				{ translate(
					'We sent a verification link to %(email)s. Please click the link in that email to verify your address.',
					{ args: { email: emailToVerify as Substitution } }
				) }
			</div>
		</LayoutBanner>
	);
}
