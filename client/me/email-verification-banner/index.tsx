import { Substitution, useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useState } from 'react';
import Banner from 'calypso/components/banner';
import EmailVerificationDialog from 'calypso/components/email-verification/email-verification-dialog';
import useGetEmailToVerify from 'calypso/components/email-verification/hooks/use-get-email-to-verify';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import {
	cooldownDisplay,
	RESEND_MIN_INTERVAL_SECONDS,
	resendThrottleRetryAfter,
} from 'calypso/lib/email-verification/resend';
import { useResendCooldown } from 'calypso/lib/email-verification/use-resend-cooldown';
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

	const { secondsUntilResend, hold: holdResend, reset: resetResend } = useResendCooldown();

	// Correcting a typo switches both the address and the endpoint, and the pending-change
	// path isn't rate limited at all, so the old wait must not carry over.
	useEffect( () => {
		resetResend();
	}, [ emailToVerify, isEmailChangePending, resetResend ] );

	const highlightEmailInput = useCallback( () => {
		emailFormEventEmitter?.dispatchEvent( new Event( 'highlightInput' ) );
	}, [] );

	const resendEmailToVerify = useCallback( async () => {
		setIsBusy( true );
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
				// A refused send is reported in the body rather than thrown, and carries nothing
				// worth showing, so it takes the generic message and starts no cooldown.
				const { success } = await sendVerificationEmail();
				if ( ! success ) {
					dispatch( errorNotice( genericError ) );
					return;
				}
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
			dispatch( errorNotice( err instanceof Error ? err.message : genericError ) );
		} finally {
			setIsBusy( false );
			setIsSendingEmail( false );
		}
	}, [
		dispatch,
		emailToVerify,
		holdResend,
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

	const { value: waitValue, unit: waitUnit } = cooldownDisplay( secondsUntilResend );
	let callToAction: React.ReactNode = translate( 'Resend email' );
	if ( secondsUntilResend > 0 ) {
		callToAction =
			waitUnit === 'minute'
				? translate( 'Resend in %(minutes)d minute', 'Resend in %(minutes)d minutes', {
						count: waitValue,
						args: { minutes: waitValue },
				  } )
				: translate( 'Resend in %(seconds)ds', { args: { seconds: waitValue } } );
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
