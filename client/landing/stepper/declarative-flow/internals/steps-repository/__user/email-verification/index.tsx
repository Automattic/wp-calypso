import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { arrowUpRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
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
	// Called once the user confirms. The account step decides when to render this gate and
	// what to do next, so eligibility isn't re-checked here.
	onDone: () => void;
}

const EmailVerificationGate = ( { flow, scope, logo, onDone }: Props ) => {
	const { __ } = useI18n();
	const email = useSelector( getCurrentUserEmail );
	const { isVerified, isSending, hasSendError, secondsUntilResend, checkStatus, checkNow, resend } =
		useEmailVerification( flow, scope );

	const hasSubmitted = useRef( false );
	const headingRef = useRef< HTMLDivElement >( null );
	const inboxLink = getInboxLink( email ?? undefined );

	const title = __( 'Verify your email' );

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

	// Resolve as soon as the user is verified — whether they confirm while the gate is open,
	// or the gate mounts already-verified (e.g. a reload after confirming). This is a hard
	// gate, so verification is the only way through.
	const finish = useCallback( () => {
		if ( hasSubmitted.current ) {
			return;
		}

		hasSubmitted.current = true;
		recordTracksEvent( 'calypso_signup_email_verification_confirmed', {
			flow,
			seconds_on_step: Math.round( ( Date.now() - gateShownAt( scope ) ) / 1000 ),
		} );
		onDone();
	}, [ flow, onDone, scope ] );

	useEffect( () => {
		if ( isVerified ) {
			finish();
		}
	}, [ isVerified, finish ] );

	const openInbox = () =>
		recordTracksEvent( 'calypso_signup_email_verification_open_inbox', {
			flow,
			provider: inboxLink?.provider,
		} );

	const subText = useMemo(
		() =>
			createInterpolateElement(
				sprintf(
					// translators: %s is the email address the verification link was sent to.
					__(
						'We just sent an email to <email>%s</email>. Click the link in the email to verify your account.'
					),
					email ?? ''
				),
				{ email: <strong /> }
			),
		[ __, email ]
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
						<Step.Heading align="left" text={ title } subText={ subText } />
					</div>
				}
			>
				{ /* For a known provider, deep-link to its inbox; confirming there resolves the
				   gate by polling. Unknown providers get a manual "I've confirmed" re-check. */ }
				{ inboxLink ? (
					<Step.PrimaryButton
						href={ inboxLink.url }
						target="_blank"
						rel="noreferrer noopener"
						onClick={ openInbox }
						icon={ arrowUpRight }
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

				{ /* Known providers get the inbox link as the primary action, so also keep a manual
				   check reachable — e.g. after confirming on a phone once polling has stopped.
				   Unknown providers already have it as the primary button. */ }
				{ inboxLink && (
					<Step.LinkButton
						onClick={ checkNow }
						isBusy={ checkStatus === 'checking' }
						disabled={ checkStatus === 'checking' }
					>
						{ __( 'I’ve already confirmed my email' ) }
					</Step.LinkButton>
				) }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerificationGate;
