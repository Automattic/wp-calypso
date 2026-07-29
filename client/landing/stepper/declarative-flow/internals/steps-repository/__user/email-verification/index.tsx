import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getInboxLink } from './inbox-links';
import { gateShownAt, markGateShown } from './storage';
import { useEmailVerification } from './use-email-verification';

import './style.scss';

interface Props {
	flow: string;
	// Storage scope for this attempt, computed once by the account step.
	scope: string;
	// Partner/Woo branding logo from the account step, so the gate keeps the same top
	// bar the signup screen had instead of switching to an unbranded one.
	logo?: ReactNode;
	// Called once the user confirms or skips. The account step decides when to render
	// this gate and what to do next, so eligibility isn't re-checked here.
	onDone: () => void;
}

const EmailVerificationGate = ( { flow, scope, logo, onDone }: Props ) => {
	const { __ } = useI18n();
	const user = useSelector( getCurrentUser );
	const { isVerified, isSending, hasSendError, secondsUntilResend, checkStatus, checkNow, resend } =
		useEmailVerification( flow, scope );

	const hasSubmitted = useRef( false );
	const headingRef = useRef< HTMLDivElement >( null );
	const inboxLink = getInboxLink( user?.email );

	const title = __( 'Verify your email' );

	const openInbox = () =>
		recordTracksEvent( 'calypso_signup_email_verification_open_inbox', {
			flow,
			provider: inboxLink?.providerName,
		} );

	// Stamp the shown-at time now the gate is actually on screen (see storage.ts).
	useEffect( () => {
		markGateShown( scope );
	}, [ scope ] );

	// This gate replaces the account form in place, without a route change, so move focus
	// onto its heading on mount — otherwise focus is stranded on the now-unmounted submit
	// button and assistive tech isn't told the screen changed.
	useEffect( () => {
		headingRef.current?.focus();
	}, [] );

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
					seconds_on_step: Math.round( ( Date.now() - gateShownAt( scope ) ) / 1000 ),
				}
			);
			onDone();
		},
		[ flow, onDone, scope ]
	);

	// Confirm as soon as the user is verified — whether they confirm while the gate is
	// open, or the gate mounts already-verified (e.g. a reload after confirming).
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
					// translators: %s is the email address the verification link was sent to.
					__(
						'We just sent an email to <email>%s</email>. Click the link in the email to verify your account.'
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
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				verticalAlign="center"
				// `step-container-v2--user` opts the gate into the account step's V2 layout
				// contract, so the step's legacy-layout styles skip it.
				className="onboarding-email-verification step-container-v2--user"
				topBar={ <Step.TopBar logo={ logo } /> }
				heading={
					<div
						ref={ headingRef }
						tabIndex={ -1 }
						className="onboarding-email-verification__heading"
					>
						<Step.Heading align="center" text={ title } subText={ subText } />
					</div>
				}
			>
				{ /* Sniper-link CTA: drop the user straight into their inbox, pre-filtered to
				   our sender. Confirming the link there resolves the gate by polling. When the
				   provider is unknown, fall back to a manual "I've confirmed" re-check. */ }
				{ inboxLink ? (
					<Step.PrimaryButton
						href={ inboxLink.url }
						target="_blank"
						rel="noreferrer noopener"
						onClick={ openInbox }
						icon={ external }
						iconPosition="right"
					>
						{ __( 'Open email inbox' ) }
					</Step.PrimaryButton>
				) : (
					<Step.PrimaryButton
						onClick={ checkNow }
						isBusy={ checkStatus === 'checking' }
						disabled={ checkStatus === 'checking' }
					>
						{ __( 'I’ve confirmed my email' ) }
					</Step.PrimaryButton>
				) }

				<Step.SecondaryButton
					onClick={ resend }
					disabled={ isSending || secondsUntilResend > 0 }
					isBusy={ isSending }
				>
					{ secondsUntilResend > 0
						? sprintf(
								// translators: %d is the number of seconds until the email can be resent.
								__( 'Resend in %ds' ),
								secondsUntilResend
						  )
						: __( 'Resend' ) }
				</Step.SecondaryButton>

				{ checkStatus === 'unconfirmed' && (
					<p className="onboarding-email-verification__notice" role="status">
						{ __(
							'We haven’t received your confirmation yet. Open the link in your inbox, then try again.'
						) }
					</p>
				) }

				{ checkStatus === 'error' && (
					<p className="onboarding-email-verification__notice is-error" role="alert">
						{ __( 'We couldn’t check right now. Please try again in a moment.' ) }
					</p>
				) }

				{ hasSendError && (
					<p className="onboarding-email-verification__notice is-error" role="alert">
						{ __( 'We couldn’t send the email. Please try again in a moment.' ) }
					</p>
				) }

				{ /* LinkButton, not SkipButton: the gate lives on the `user` route, so
				   SkipButton's automatic `calypso_signup_skip_step` would wrongly report a
				   skip of account creation. Only our own `_skipped` event should fire. */ }
				<Step.LinkButton onClick={ onSkip }>{ __( 'I’ll do this later' ) }</Step.LinkButton>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerificationGate;
