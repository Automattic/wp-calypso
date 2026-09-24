import { Step } from '@automattic/onboarding';
import { useEffect, useRef } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { useSelector } from 'calypso/state';
import {
	getCurrentUserEmail,
	getCurrentUserId,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { useQuery } from '../../../../hooks/use-query';
import EmailVerificationGate from '../__user/email-verification';
import { claimGateConfirmation, gateScope } from '../__user/email-verification/storage';
import EmailVerifiedConfirmation from './confirmation';
import type { Step as StepType } from '../../types';

/**
 * The deferred email verification gate (Variant B). Unlike the account-step gate, this runs as a
 * step of its own so the flow can place it after the free plan selection or after checkout — the
 * latter returns from an external page by URL, which the framework's account step can't answer.
 *
 * The gate component owns the polling and the resend; this step owns advancing the flow once `/me`
 * reports the account verified. Correcting the address isn't offered here: by this point the
 * account exists (and, on the paid path, has already been paid for), and there's no account form to
 * return to.
 */
const EmailVerificationStep: StepType = function EmailVerificationStep( { flow, navigation } ) {
	const userId = useSelector( getCurrentUserId );
	const email = useSelector( getCurrentUserEmail );
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const { topBarLogo } = usePartnerBranding();
	const scope = gateScope( flow, userId );

	// The confirmation-link tab lands here with `?confirmed=1`. It shows a static notice and does
	// nothing else — no polling, no advancing — so it can't race the original (polling) tab into
	// site creation, which would surface a `blog_name_exists` error on the losing tab.
	const isConfirmationView = useQuery().has( 'confirmed' );

	// `navigation` is a fresh object each render, so the effect re-runs on unrelated re-renders;
	// this keeps the advance (and its event) to once per verified attempt.
	const hasAdvanced = useRef( false );

	useEffect( () => {
		if ( isConfirmationView || ! isVerified || hasAdvanced.current ) {
			return;
		}
		hasAdvanced.current = true;
		// Only the tab that opened the gate records the confirmation; a link opened in another tab of
		// the same browser resolves this one by polling.
		const claim = claimGateConfirmation( scope );
		if ( claim ) {
			recordTracksEvent( 'calypso_signup_email_verification_confirmed', {
				flow,
				seconds_on_step: claim.secondsOnStep,
			} );
		}
		navigation.submit?.();
	}, [ isConfirmationView, isVerified, scope, flow, navigation ] );

	if ( isConfirmationView ) {
		return (
			<EmailVerifiedConfirmation
				logo={ topBarLogo }
				onContinue={ () => window.location.assign( '/setup/onboarding' ) }
			/>
		);
	}

	if ( isVerified ) {
		return <Step.Loading />;
	}

	return (
		<EmailVerificationGate
			flow={ flow }
			scope={ scope }
			email={ email ?? '' }
			addressSettled
			logo={ topBarLogo }
		/>
	);
};

export default EmailVerificationStep;
