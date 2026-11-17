import { Step } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { formatCooldown } from 'calypso/dashboard/utils/email-verification-resend';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { CONFIRMED_RECHECK_DELAYS_MS } from './constants';
import { useBackoffPoll } from './hooks/use-backoff-poll';
import { useResendVerificationEmail } from './hooks/use-resend-verification-email';
import { Screen } from './screen';

type Props = {
	email: string;
	// Asks the eligibility endpoint again once the account email is confirmed.
	onConfirmed: () => void;
	isChecking: boolean;
	checkFailed: boolean;
};

const ConfirmEmail = ( { email, onConfirmed, isChecking, checkFailed }: Props ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );

	// The eligibility endpoint is rate limited, so the polling reads `/me`, and the endpoint is
	// asked again only when `/me` reports the email as confirmed. `UserVerificationChecker` catches
	// a confirmation in another tab of this browser; the poll catches one on another device.
	const { restart: restartPoll } = useBackoffPoll(
		() => dispatch( fetchCurrentUser() ),
		! isVerified
	);
	const { status, secondsUntilResend, resend } = useResendVerificationEmail( restartPoll );

	// This screen stays up while the endpoint answers `unverified`, so a confirmed email gets a few
	// spaced checks and then a manual retry, instead of a page that waits for nothing.
	const [ recheckCount, setRecheckCount ] = useState( 0 );
	const rechecksExhausted = recheckCount >= CONFIRMED_RECHECK_DELAYS_MS.length;

	useEffect( () => {
		if ( ! isVerified || isChecking || checkFailed || rechecksExhausted ) {
			return;
		}
		const timer = setTimeout( () => {
			setRecheckCount( ( count ) => count + 1 );
			onConfirmed();
		}, CONFIRMED_RECHECK_DELAYS_MS[ recheckCount ] );
		return () => clearTimeout( timer );
	}, [ isVerified, isChecking, checkFailed, rechecksExhausted, recheckCount ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const resendLabel =
		secondsUntilResend > 0
			? sprintf(
					/* translators: %s is a countdown to when the email can be sent again, e.g. 4:59. */
					__( 'Resend email (%s)' ),
					formatCooldown( secondsUntilResend )
				)
			: __( 'Resend email' );

	return (
		<Screen
			title={ __( 'Confirm your email to get the Student plan' ) }
			subText={ sprintf(
				/* translators: %s is the email address of the account. */
				__(
					'Open the confirmation link we sent to %s. This page continues on its own once your email is confirmed.'
				),
				email
			) }
		>
			<UserVerificationChecker />
			<Step.SecondaryButton
				onClick={ resend }
				disabled={ status === 'sending' || secondsUntilResend > 0 }
				isBusy={ status === 'sending' }
			>
				{ resendLabel }
			</Step.SecondaryButton>
			{ status === 'sent' && (
				<p className="student-plan-eligibility__notice" role="status">
					{ __( 'We sent the email again. Check your inbox and spam folder.' ) }
				</p>
			) }
			{ status === 'error' && (
				<p className="student-plan-eligibility__error" role="alert">
					{ __( 'We couldn’t send the email. Please try again in a moment.' ) }
				</p>
			) }
			{ status === 'throttled' && (
				<p className="student-plan-eligibility__notice" role="status">
					{ __( 'Too many attempts. Please wait before trying again.' ) }
				</p>
			) }
			{ isVerified && ( checkFailed || rechecksExhausted ) && ! isChecking && (
				<div className="student-plan-eligibility__actions">
					<p className="student-plan-eligibility__error" role="alert">
						{ __( 'Your email is confirmed, but we couldn’t continue. Please try again.' ) }
					</p>
					<Step.PrimaryButton onClick={ onConfirmed }>{ __( 'Try again' ) }</Step.PrimaryButton>
				</div>
			) }
		</Screen>
	);
};

export default ConfirmEmail;
