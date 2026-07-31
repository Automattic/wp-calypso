import { Substitution, useTranslate } from 'i18n-calypso';
import React, { useCallback, useRef, useState } from 'react';
import Banner from 'calypso/components/banner';
import EmailVerificationDialog from 'calypso/components/email-verification/email-verification-dialog';
import useGetEmailToVerify from 'calypso/components/email-verification/hooks/use-get-email-to-verify';
import {
	RESEND_MIN_INTERVAL_SECONDS,
	resendThrottleRetryAfter,
	useSendEmailVerification,
} from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { emailFormEventEmitter } from 'calypso/me/account/account-email-field';
import { useDispatch, useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import { setUnsavedUserSetting } from 'calypso/state/user-settings/actions';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';
import './style.scss';

const EmailVerificationBanner: React.FC< {
	customDescription?: string | React.ReactNode;
	dialogCloseLabel?: string | React.ReactNode;
	dialogCloseAction?: () => void;
} > = ( { customDescription, dialogCloseLabel, dialogCloseAction = () => {} } ) => {
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const translate = useTranslate();
	const [ isDialogOpen, setIsDialogOpen ] = useState( false );

	if ( isVerified && ! isEmailChangePending ) {
		return null;
	}

	return (
		<>
			{ isDialogOpen && (
				<EmailVerificationDialog
					onClose={ () => setIsDialogOpen( false ) }
					closeLabel={ dialogCloseLabel }
					// We only want this triggered from the close button, but not from clicking
					// outside to close the modal (so not adding to onClose prop).
					closeButtonAction={ dialogCloseAction }
				/>
			) }
			<Banner
				className="email-verification-banner"
				title={ translate( 'Verify your email address.' ) }
				description={
					customDescription
						? customDescription
						: translate(
								'Verifying your email helps you secure your WordPress.com account and enables key features, like changing your username.'
						  )
				}
				callToAction={ translate( 'Verify email' ) }
				onClick={ () => {
					setIsDialogOpen( true );
				} }
				icon="notice"
				disableHref
			/>
		</>
	);
};

interface Props {
	setIsBusy: ( isBusy: boolean ) => void;
}

const EmailVerificationBannerV2: React.FC< Props > = ( { setIsBusy } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const emailToVerify = useGetEmailToVerify();
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const sendVerificationEmail = useSendEmailVerification();
	const [ isSendingEmail, setIsSendingEmail ] = useState( false );

	// The server allows one resend a minute and five an hour, so the button would otherwise
	// invite a click it is going to refuse. Anchored to a timestamp rather than decremented,
	// because timers are suspended while the tab is in the background.
	const resendAvailableAtRef = useRef( 0 );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( 0 );

	const holdResend = ( seconds: number ) => {
		resendAvailableAtRef.current = Date.now() + seconds * 1000;
		setSecondsUntilResend( seconds );
	};

	useInterval(
		() =>
			setSecondsUntilResend(
				Math.max( 0, Math.ceil( ( resendAvailableAtRef.current - Date.now() ) / 1000 ) )
			),
		secondsUntilResend > 0 && EVERY_SECOND
	);

	const highlightEmailInput = useCallback( () => {
		emailFormEventEmitter?.dispatchEvent( new Event( 'highlightInput' ) );
	}, [] );

	const resendEmailToVerify = useCallback( async () => {
		setIsBusy( true );
		setIsSendingEmail( true );
		try {
			if ( isEmailChangePending ) {
				// For pending email changes, re-submit the new email via PUT /me/settings
				// since POST /me/send-verification-email only works for the original email.
				dispatch( setUnsavedUserSetting( 'user_email', emailToVerify ) );
				await dispatch( saveUnsavedUserSettings( [ 'user_email' ] ) );
			} else {
				// For unverified original emails, use the dedicated endpoint since
				// PUT /me/settings won't resend when the email hasn't changed.
				await sendVerificationEmail();
			}
			holdResend( RESEND_MIN_INTERVAL_SECONDS );
			dispatch(
				successNotice(
					translate(
						'We sent an email to %(email)s. Please check your inbox to verify your email.',
						{
							args: { email: emailToVerify as Substitution },
						}
					)
				)
			);
		} catch ( err ) {
			// A refusal is not a failure: hold the button for as long as the server says it
			// will keep refusing, and report the wait rather than a generic error.
			const retryAfter = resendThrottleRetryAfter( err );
			if ( retryAfter !== null ) {
				holdResend( retryAfter );
			}
			dispatch(
				errorNotice(
					err instanceof Error
						? err.message
						: translate( 'There was an error while resending the email. Please try again.' )
				)
			);
		} finally {
			setIsBusy( false );
			setIsSendingEmail( false );
		}
	}, [
		dispatch,
		emailToVerify,
		isEmailChangePending,
		sendVerificationEmail,
		setIsBusy,
		translate,
	] );

	if ( ! emailToVerify ) {
		return null;
	}

	const description = translate(
		'Check your inbox at {{strong}}%(email)s{{/strong}} for the confirmation email, or click "Resend email" to get a new one.',
		{
			args: { email: emailToVerify as Substitution },
			components: {
				strong: <strong className="email-verification-banner__highlight" />,
			},
		}
	);

	// The wait is a minute after a send, but up to an hour once the hourly allowance is spent,
	// and "Resend in 2700s" is not a number anyone reads.
	let callToAction: React.ReactNode = translate( 'Resend email' );
	if ( secondsUntilResend > 60 ) {
		const minutes = Math.ceil( secondsUntilResend / 60 );
		callToAction = translate( 'Resend in %(minutes)d minute', 'Resend in %(minutes)d minutes', {
			count: minutes,
			args: { minutes },
		} );
	} else if ( secondsUntilResend > 0 ) {
		callToAction = translate( 'Resend in %(seconds)ds', {
			args: { seconds: secondsUntilResend },
		} );
	}

	return (
		<Banner
			className="email-verification-banner"
			icon="notice"
			title={ translate( 'Verify your email' ) }
			description={ description }
			callToAction={ callToAction }
			isCallToActionDisabled={ secondsUntilResend > 0 }
			onClick={ resendEmailToVerify }
			secondaryCallToAction={ translate( 'Update email' ) }
			secondaryOnClick={ highlightEmailInput }
			disableHref
			isBusy={ isSendingEmail }
		/>
	);
};

export { EmailVerificationBannerV2 };
export default EmailVerificationBanner;
