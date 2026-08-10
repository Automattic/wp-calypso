import { Button } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { Button as WPButton, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { arrowUpRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, type ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { formatCooldown } from 'calypso/dashboard/utils/email-verification-resend';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { useIsEmailWriteInFlight } from '../use-email-change-request';
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
	// Partner/Woo branding, so the top bar doesn't change when the gate replaces the form.
	logo?: ReactNode;
	// The address the activation email went to, which after a correction is the one just accepted
	// rather than the one `/me` still reports.
	email: string;
	// Returns to the account step to correct the address this was sent to.
	onEditEmail: () => void;
	// Set while a correction is waiting to be confirmed, which changes what resending has to do.
	pendingEmail?: string;
	// Whether the address above is the one being waited on, or is standing in until the settings
	// answer. What would go somewhere on its strength waits for it — correcting it does not, since
	// a correction of the wrong address asks for no change and is answered as none.
	addressSettled: boolean;
}

const EmailVerificationGate = ( {
	flow,
	scope,
	logo,
	email,
	onEditEmail,
	pendingEmail,
	addressSettled,
}: Props ) => {
	const { __ } = useI18n();
	const isWriteInFlight = useIsEmailWriteInFlight();
	const { sendStatus, secondsUntilResend, resend } = useEmailVerification(
		flow,
		scope,
		pendingEmail
	);

	const headingRef = useRef< HTMLDivElement >( null );
	// Either kind of send: one shares a mutation scope, the other is only known to this component.
	const isSending = isWriteInFlight || sendStatus === 'sending';
	const inboxLink = getInboxLink( email );
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
			recordTracksEvent( 'calypso_signup_email_verification_view', { flow, provider } );
		}
	}, [ scope, flow, provider ] );

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

	const subText = createInterpolateElement(
		sprintf(
			// translators: %s is the email address the verification link was sent to.
			__(
				'We just sent an email to <email>%s</email> (<edit>edit</edit>). Click the link in the email to verify your account.'
			),
			email
		),
		{
			email: <strong />,
			edit: (
				<WPButton
					variant="link"
					// A correction submitted now would queue behind the send, and a reload while it
					// waited would leave the address written down with nothing able to carry it out.
					disabled={ isSending }
					onClick={ () => {
						recordTracksEvent( 'calypso_signup_email_verification_edit_click', { flow } );
						onEditEmail();
					} }
				/>
			),
		}
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
						   and weight. A known provider gets an inbox deep link; confirming there — or
						   anywhere else — resolves the gate by polling, so nothing else is needed. */ }
						{ inboxLink && addressSettled && (
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
							disabled={ isSending || secondsUntilResend > 0 || ! addressSettled }
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
