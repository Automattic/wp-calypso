import { Button } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { arrowUpRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { formatCooldown } from 'calypso/dashboard/utils/email-verification-resend';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { getInboxLink } from './inbox-links';
import { markGateShown } from './storage';
import { useEmailVerification } from './use-email-verification';

import './style.scss';

// The description sits outside the heading, so the heading points at it to be announced with it.
const SUB_TEXT_ID = 'onboarding-email-verification-sub-text';

interface Props {
	flow: string;
	// Storage scope for this attempt, computed once by the account step.
	scope: string;
	// Whether an email was just sent, as against one carried over from an earlier signup.
	isNewSignup: boolean;
	// Partner/Woo branding, so the top bar doesn't change when the gate replaces the form.
	logo?: ReactNode;
}

const EmailVerificationGate = ( { flow, scope, isNewSignup, logo }: Props ) => {
	const { __ } = useI18n();
	const email = useSelector( getCurrentUserEmail );
	const { sendStatus, secondsUntilResend, resend } = useEmailVerification( flow, scope );

	const headingRef = useRef< HTMLDivElement >( null );
	const inboxLink = getInboxLink( email ?? undefined );
	// A stable dependency: `inboxLink` is a fresh object every render.
	const provider = inboxLink?.provider ?? 'none';

	const title = __( 'Verify your email' );

	const resendLabel =
		secondsUntilResend > 0
			? sprintf(
					// translators: %s is a countdown to when the email can be resent, e.g. 4:59.
					__( 'Resend (%s)' ),
					formatCooldown( secondsUntilResend )
			  )
			: __( 'Resend' );

	// The denominator for the clicks and confirmations that follow, and for the drop-offs that
	// don't. `provider` is `none` when the address has no inbox link.
	useEffect( () => {
		if ( markGateShown( scope ) ) {
			recordTracksEvent( 'calypso_signup_email_verification_view', {
				flow,
				provider,
				is_new_signup: isNewSignup,
			} );
		}
	}, [ scope, flow, provider, isNewSignup ] );

	// The gate replaces the account form without a route change, so move focus onto its heading
	// — otherwise it strands on the unmounted submit button and the screen change goes unsaid.
	useEffect( () => {
		headingRef.current?.focus();
	}, [] );

	const openInbox = () =>
		recordTracksEvent( 'calypso_signup_email_verification_open_inbox', {
			flow,
			provider: inboxLink?.provider,
		} );

	// Nothing was just sent to someone who arrived already unverified from an earlier signup.
	const subText = useMemo( () => {
		const text = isNewSignup
			? sprintf(
					// translators: %s is the email address the verification link was sent to.
					__(
						'We just sent an email to <email>%s</email>. Click the link in the email to verify your account.'
					),
					email ?? ''
			  )
			: sprintf(
					// translators: %s is the email address the verification link was sent to.
					__(
						'Check your inbox for the verification email we sent to <email>%s</email>, or send yourself a new one below.'
					),
					email ?? ''
			  );

		return createInterpolateElement( text, { email: <strong /> } );
	}, [ __, email, isNewSignup ] );

	return (
		<>
			<DocumentHead title={ title } />
			{ /* Confirming in another tab of this browser resolves the step immediately. */ }
			<UserVerificationChecker />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				// Same column width as the content row, so the copy lines up with the buttons.
				headingColumnWidth={ 4 }
				verticalAlign="center"
				// The 24px below the title is declared on the content row instead (see style.scss).
				noGap
				// Opts the gate into the account step's V2 layout contract, so the step's
				// legacy-layout styles skip it.
				className="onboarding-email-verification step-container-v2--user"
				topBar={ <Step.TopBar logo={ logo } /> }
				heading={
					<div
						ref={ headingRef }
						tabIndex={ -1 }
						aria-describedby={ SUB_TEXT_ID }
						className="onboarding-email-verification__heading"
					>
						<Step.Heading align="left" text={ title } />
					</div>
				}
			>
				<VStack spacing={ 8 }>
					<p className="onboarding-email-verification__sub-text" id={ SUB_TEXT_ID }>
						{ subText }
					</p>

					<VStack spacing={ 3 }>
						{ /* Calypso's Button, not the Step.* ones: the design follows its outline, radius,
						   and weight. A known provider gets an inbox deep link; confirming there — or
						   anywhere else — resolves the gate by polling, so nothing else is needed. */ }
						{ inboxLink && (
							<Button
								primary
								href={ inboxLink.url }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ openInbox }
							>
								{ __( 'Open email inbox' ) }
								<Icon icon={ arrowUpRight } size={ 16 } fill="currentColor" />
							</Button>
						) }

						<Button
							onClick={ resend }
							disabled={ sendStatus === 'sending' || secondsUntilResend > 0 }
							busy={ sendStatus === 'sending' }
						>
							{ resendLabel }
						</Button>

						{ sendStatus === 'error' && (
							<p className="onboarding-email-verification__notice is-error" role="alert">
								{ __( 'We couldn’t send the email. Please try again in a moment.' ) }
							</p>
						) }

						{ sendStatus === 'throttled' && secondsUntilResend > 0 && (
							<p className="onboarding-email-verification__notice" role="status">
								{ __( 'Too many attempts. Please wait before trying again.' ) }
							</p>
						) }
					</VStack>
				</VStack>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerificationGate;
