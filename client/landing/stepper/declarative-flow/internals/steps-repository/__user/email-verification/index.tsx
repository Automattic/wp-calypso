import { Button } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { arrowUpRight, Icon } from '@wordpress/icons';
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

// The description sits outside the heading, so the heading points at it to be announced with it.
const SUB_TEXT_ID = 'onboarding-email-verification-sub-text';

interface Props {
	flow: string;
	// Storage scope for this attempt, computed once by the account step.
	scope: string;
	// Partner/Woo branding, so the top bar doesn't change when the gate replaces the form.
	logo?: ReactNode;
	// Called once the user confirms; the account step owns eligibility and what follows.
	onDone: () => void;
}

const EmailVerificationGate = ( { flow, scope, logo, onDone }: Props ) => {
	const { __, _n } = useI18n();
	const email = useSelector( getCurrentUserEmail );
	const { isVerified, sendStatus, secondsUntilResend, checkStatus, checkNow, resend } =
		useEmailVerification( flow, scope );

	const hasSubmitted = useRef( false );
	const headingRef = useRef< HTMLDivElement >( null );
	const inboxLink = getInboxLink( email ?? undefined );

	const title = __( 'Verify your email' );

	// The interval is seconds, but a server lockout runs to an hour, and "Resend in 2700s" is
	// not a number anyone reads.
	let resendLabel: string = __( 'Resend' );
	if ( secondsUntilResend > 60 ) {
		const minutes = Math.ceil( secondsUntilResend / 60 );
		resendLabel = sprintf(
			// translators: %d is the number of minutes until the email can be resent.
			_n( 'Resend in %d minute', 'Resend in %d minutes', minutes ),
			minutes
		);
	} else if ( secondsUntilResend > 0 ) {
		resendLabel = sprintf(
			// translators: %d is the number of seconds until the email can be resent.
			__( 'Resend in %ds' ),
			secondsUntilResend
		);
	}

	// Stamp the shown-at time now the gate is actually on screen (see storage.ts).
	useEffect( () => {
		markGateShown( scope );
	}, [ scope ] );

	// The gate replaces the account form without a route change, so move focus onto its heading
	// — otherwise it strands on the unmounted submit button and the screen change goes unsaid.
	useEffect( () => {
		headingRef.current?.focus();
	}, [] );

	// Covers confirming while the gate is open and mounting already-verified, e.g. a reload
	// after confirming.
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
						   and weight. A known provider gets an inbox deep link — confirming there
						   resolves the gate by polling; the rest get a manual re-check. */ }
						{ inboxLink ? (
							<Button primary href={ inboxLink.url } target="_blank" onClick={ openInbox }>
								{ __( 'Open email inbox' ) }
								<Icon icon={ arrowUpRight } size={ 16 } fill="currentColor" />
							</Button>
						) : (
							<Button
								primary
								onClick={ checkNow }
								busy={ checkStatus === 'checking' }
								disabled={ checkStatus === 'checking' }
							>
								{ __( 'I’ve confirmed my email' ) }
							</Button>
						) }

						<Button
							onClick={ resend }
							disabled={ sendStatus === 'sending' || secondsUntilResend > 0 }
							busy={ sendStatus === 'sending' }
						>
							{ resendLabel }
						</Button>

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

						{ sendStatus === 'error' && (
							<p className="onboarding-email-verification__notice is-error" role="alert">
								{ __( 'We couldn’t send the email. Please try again in a moment.' ) }
							</p>
						) }

						{ sendStatus === 'throttled' && (
							<p className="onboarding-email-verification__notice" role="status">
								{ __(
									'That’s a lot of emails. Look for one we’ve already sent — the button unlocks shortly.'
								) }
							</p>
						) }
					</VStack>
				</VStack>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default EmailVerificationGate;
