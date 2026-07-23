import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
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
	} = useEmailVerification( flow );

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

	useEffect( () => {
		if ( isVerified ) {
			finish( true );
		}
	}, [ isVerified, finish ] );

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

	return (
		<>
			<DocumentHead title={ title } />
			{ /* Confirming in another tab of this browser resolves the step immediately. */ }
			<UserVerificationChecker />
			{ /* No back button: the site already exists by the time this gate shows, so
			   the only ways forward are confirming or skipping to the dashboard. */ }
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
