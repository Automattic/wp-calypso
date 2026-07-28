import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { getSignupIsNewUser } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentUser, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { useEmailVerification } from './use-email-verification';
import type { Step as StepType } from '../../types';

import './style.scss';

const EmailVerification: StepType< {
	submits: {
		emailVerified: boolean;
	};
} > = function EmailVerification( { navigation, flow } ) {
	const { __ } = useI18n();
	const user = useSelector( getCurrentUser );
	const isVerifiedAtEntry = useSelector( isCurrentUserEmailVerified );

	// Capture eligibility once. Only new email signups who arrive unverified see the
	// gate; social logins and existing accounts (and anyone already verified) pass
	// straight through without recording a view or confirmation.
	const eligibility = useRef< boolean | null >( null );
	if ( eligibility.current === null ) {
		eligibility.current =
			Boolean( user?.ID && getSignupIsNewUser( user.ID ) ) && ! isVerifiedAtEntry;
	}
	const isEligible = eligibility.current;

	const {
		isVerified,
		isSending,
		hasSendError,
		secondsUntilResend,
		isChecking,
		hasFailedCheck,
		hasCheckError,
		checkNow,
		resend,
	} = useEmailVerification( flow, isEligible );

	const shownAt = useRef( Date.now() );
	const hasSubmitted = useRef( false );

	const title = __( 'Confirm your email address' );

	const finish = useCallback(
		( emailVerified: boolean ) => {
			if ( hasSubmitted.current ) {
				return;
			}

			hasSubmitted.current = true;
			recordTracksEvent(
				emailVerified
					? 'calypso_signup_email_verification_confirmed'
					: 'calypso_signup_email_verification_skipped',
				{
					flow,
					seconds_on_step: Math.round( ( Date.now() - shownAt.current ) / 1000 ),
				}
			);
			navigation.submit( { emailVerified } );
		},
		[ flow, navigation ]
	);

	// Ineligible visitors continue immediately with no tracking, so the experiment
	// only ever counts people who actually went through verification.
	useEffect( () => {
		if ( isEligible || hasSubmitted.current ) {
			return;
		}
		hasSubmitted.current = true;
		navigation.submit( { emailVerified: isVerified } );
	}, [ isEligible, isVerified, navigation ] );

	// Record confirmation only for a genuine unverified → verified transition.
	useEffect( () => {
		if ( isEligible && isVerified ) {
			finish( true );
		}
	}, [ isEligible, isVerified, finish ] );

	const onSkip = () => finish( false );

	const subText = useMemo(
		() =>
			createInterpolateElement(
				sprintf(
					// translators: %s is the email address the confirmation link was sent to.
					__(
						'Click the link we sent to <email>%s</email> and we’ll pick up right where you left off.'
					),
					user?.email ?? ''
				),
				{ email: <strong /> }
			),
		[ __, user?.email ]
	);

	if ( ! isEligible ) {
		return null;
	}

	return (
		<>
			<DocumentHead title={ title } />
			{ /* Confirming in another tab of this browser resolves the step immediately. */ }
			<UserVerificationChecker />
			{ /* No back button for now: the previous step is account creation, which a
			   logged-in user can't return to. A "change email" affordance is pending design. */ }
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				verticalAlign="center"
				className="onboarding-email-verification"
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading align="center" text={ title } subText={ subText } /> }
			>
				<Step.PrimaryButton onClick={ checkNow } isBusy={ isChecking } disabled={ isChecking }>
					{ __( 'I’ve confirmed my email' ) }
				</Step.PrimaryButton>

				{ hasFailedCheck && (
					<p className="onboarding-email-verification__notice" role="status">
						{ __(
							'We haven’t received your confirmation yet. Open the link in your inbox, then try again.'
						) }
					</p>
				) }

				{ hasCheckError && (
					<p className="onboarding-email-verification__notice is-error" role="alert">
						{ __( 'We couldn’t check right now. Please try again in a moment.' ) }
					</p>
				) }

				{ hasSendError && (
					<p className="onboarding-email-verification__notice is-error" role="alert">
						{ __( 'We couldn’t send the email. Please try again in a moment.' ) }
					</p>
				) }

				<p className="onboarding-email-verification__resend">
					{ secondsUntilResend > 0
						? sprintf(
								// translators: %d is the number of seconds the user has to wait before the email can be sent again.
								__(
									'Nothing in your inbox? Check your spam folder. You can resend the email in %ds.'
								),
								secondsUntilResend
						  )
						: createInterpolateElement(
								__(
									'Nothing in your inbox? Check your spam folder, or <resend>resend the email</resend>.'
								),
								{
									resend: (
										<Step.LinkButton
											onClick={ resend }
											disabled={ isSending }
											isBusy={ isSending }
										/>
									),
								}
						  ) }
				</p>

				<Step.SkipButton onClick={ onSkip }>{ __( 'I’ll do this later' ) }</Step.SkipButton>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerification;
