import { Step } from '@automattic/onboarding';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { chevronLeft, external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getInboxLink } from './inbox-links';
import {
	gateShownAt,
	getPendingEmail,
	markGateShown,
	PENDING_EMAIL_RESEND_COOLDOWN_SECONDS,
	setPendingEmail,
} from './storage';
import { useEmailVerification } from './use-email-verification';
import { useUpdateEmail } from './use-update-email';

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
	const user = useSelector( getCurrentUser );
	const hasSubmitted = useRef( false );
	const headingRef = useRef< HTMLDivElement >( null );
	const emailInputRef = useRef< HTMLInputElement >( null );

	// After a change the account keeps its old email until the new one is confirmed, so track
	// the pending new address to display and re-verify against. It's persisted (seeded from
	// storage here) so it survives a refresh — `/me` alone can't recover it.
	const [ pendingEmail, setPendingEmailState ] = useState< string | null >(
		() => getPendingEmail( scope ) ?? null
	);
	const [ isEditing, setIsEditing ] = useState( false );
	const [ emailInput, setEmailInput ] = useState( '' );

	const {
		isVerified,
		isSending,
		hasSendError,
		secondsUntilResend,
		checkStatus,
		checkNow,
		resend,
		noteSent,
	} = useEmailVerification( flow, scope, pendingEmail );
	const { status: updateStatus, updateEmail } = useUpdateEmail();

	const shownEmail = pendingEmail ?? user?.email ?? '';
	const inboxLink = getInboxLink( shownEmail );

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

	// Focus the field when the edit form opens so the user can type straight away.
	useEffect( () => {
		if ( isEditing ) {
			emailInputRef.current?.focus();
		}
	}, [ isEditing ] );

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
			provider: inboxLink?.providerName,
		} );

	const startEditing = () => {
		recordTracksEvent( 'calypso_signup_email_verification_update_email', { flow } );
		setEmailInput( shownEmail );
		setIsEditing( true );
	};

	// Closing the editor removes the focused field, so return focus to the heading.
	const closeEditor = () => {
		setIsEditing( false );
		headingRef.current?.focus();
	};

	const submitNewEmail = async ( event: React.FormEvent ) => {
		event.preventDefault();
		const next = emailInput.trim();
		if ( ! next || next === shownEmail ) {
			closeEditor();
			return;
		}
		const target = await updateEmail( next, Boolean( pendingEmail ) );
		if ( target ) {
			// The change sends a fresh confirmation to the new address; persist and verify
			// against it. Pass the pending-change cooldown explicitly — this render's
			// `noteSent` still sees the pre-switch (60s) one.
			setPendingEmail( scope, target );
			setPendingEmailState( target );
			noteSent( PENDING_EMAIL_RESEND_COOLDOWN_SECONDS );
			closeEditor();
		}
	};

	const subText = useMemo(
		() =>
			createInterpolateElement(
				sprintf(
					// translators: %s is the email address the verification link was sent to.
					__(
						'We just sent an email to <email>%s</email>. Click the link in the email to verify your account.'
					),
					shownEmail
				),
				{ email: <strong /> }
			),
		[ __, shownEmail ]
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
				{ isEditing ? (
					<form className="onboarding-email-verification__edit" onSubmit={ submitNewEmail }>
						<input
							ref={ emailInputRef }
							type="email"
							className="onboarding-email-verification__email-input"
							aria-label={ __( 'Email address' ) }
							value={ emailInput }
							onChange={ ( event ) => setEmailInput( event.target.value ) }
							autoComplete="email"
						/>
						<Step.PrimaryButton
							type="submit"
							isBusy={ updateStatus === 'saving' }
							disabled={ updateStatus === 'saving' }
						>
							{ __( 'Save' ) }
						</Step.PrimaryButton>
						{ updateStatus === 'error' && (
							<p className="onboarding-email-verification__notice is-error" role="alert">
								{ __( 'We couldn’t update your email. Please try again in a moment.' ) }
							</p>
						) }
						<Step.LinkButton onClick={ closeEditor } icon={ chevronLeft } iconPosition="left">
							{ __( 'Back' ) }
						</Step.LinkButton>
					</form>
				) : (
					<>
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

						{ /* Known providers get the inbox link as the primary action, so also keep a
						   manual check reachable — e.g. after confirming on a phone once polling has
						   stopped. Unknown providers already have it as the primary button. */ }
						{ inboxLink && (
							<Step.LinkButton
								onClick={ checkNow }
								isBusy={ checkStatus === 'checking' }
								disabled={ checkStatus === 'checking' }
							>
								{ __( 'I’ve already confirmed my email' ) }
							</Step.LinkButton>
						) }

						<Step.LinkButton onClick={ startEditing } icon={ chevronLeft } iconPosition="left">
							{ __( 'Update email' ) }
						</Step.LinkButton>
					</>
				) }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerificationGate;
