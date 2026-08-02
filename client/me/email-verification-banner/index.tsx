import { Substitution, useTranslate } from 'i18n-calypso';
import React, { useCallback, useEffect, useState } from 'react';
import Banner from 'calypso/components/banner';
import EmailVerificationDialog from 'calypso/components/email-verification/email-verification-dialog';
import useGetEmailToVerify from 'calypso/components/email-verification/hooks/use-get-email-to-verify';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import {
	formatCooldown,
	resendAcceptedRetryAfter,
	resendThrottleRetryAfter,
} from 'calypso/lib/email-verification/resend';
import { useResendCooldown } from 'calypso/lib/email-verification/use-resend-cooldown';
import { emailFormEventEmitter } from 'calypso/me/account/account-email-field';
import { useDispatch, useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
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

	// Where a resend would actually go, from saved settings only: `emailToVerify` also reflects
	// unsaved input, which changes on every keystroke without changing the target.
	const savedSettings = useSelector( getUserSettings );
	const resendTarget = isEmailChangePending
		? `pending:${ savedSettings?.new_user_email ?? '' }`
		: `original:${ savedSettings?.user_email ?? '' }`;

	// Correcting a typo switches both the address and the endpoint, and the pending-change path
	// isn't rate limited at all, so the old wait must not carry over.
	useEffect( () => {
		resetResend();
	}, [ resendTarget, resetResend ] );

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
				// A refusal is reported in the body rather than thrown, and carries nothing to show.
				const response = await sendVerificationEmail();
				if ( ! response?.success ) {
					dispatch( errorNotice( genericError ) );
					return;
				}
				// Only this path is rate limited, so only this one holds the button.
				holdResend( resendAcceptedRetryAfter( response ) );
			}
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
			// Not a failure: hold for as long as the server says it will keep refusing.
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

	const callToAction: React.ReactNode =
		secondsUntilResend > 0
			? translate( 'Resend email (%(countdown)s)', {
					args: { countdown: formatCooldown( secondsUntilResend ) },
					comment: 'countdown to when the verification email can be resent, e.g. 4:59',
			  } )
			: translate( 'Resend email' );

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
