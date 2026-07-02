import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useDispatch, useSelector } from 'calypso/state';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';

import './style.scss';

// The launch endpoint returns this code only for Write On sites whose owner has
// an unverified email, so reacting to it here is inherently scoped to that flow.
const EMAIL_UNVERIFIED = 'email_unverified';

function getErrorCode( errors ) {
	return errors?.error ?? errors?.code;
}

function LaunchSiteComponent( { flowName, stepName, positionInFlow } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const step = useSelector( ( state ) => getSignupProgress( state )?.[ stepName ] );
	const status = step?.status;
	const isEmailUnverified =
		status === 'invalid' && getErrorCode( step?.errors ) === EMAIL_UNVERIFIED;

	// Kick off the launch, but only when the step hasn't been submitted yet. The
	// flow's processing screen unmounts this step while the request runs, so an
	// unguarded submit would resubmit on every remount and loop endlessly. On
	// success the flow controller advances the flow; a failure lands back here.
	useEffect( () => {
		if ( ! status ) {
			dispatch( submitSignupStep( { stepName } ) );
		}
	}, [ dispatch, stepName, status ] );

	// While pending/processing the flow shows its own launch screen, and success
	// navigates away — so this step only renders when the launch is blocked on
	// email verification.
	if ( ! isEmailUnverified ) {
		return null;
	}

	return (
		<StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			hideFormattedHeader
			hideSkip
			hideBack
			stepContent={
				<div className="launch-site__verify-email">
					<h2 className="launch-site__verify-email-title">
						{ translate( 'Verify your email to launch' ) }
					</h2>
					<p className="launch-site__verify-email-description">
						{ translate(
							'Please verify your email address before launching your site, then try again.'
						) }
					</p>
					<div className="launch-site__verify-email-actions">
						<Button
							variant="primary"
							onClick={ () => dispatch( submitSignupStep( { stepName } ) ) }
						>
							{ translate( 'Try again' ) }
						</Button>
						<Button
							variant="secondary"
							onClick={ () => dispatch( verifyEmail( { showGlobalNotices: true } ) ) }
						>
							{ translate( 'Resend verification email' ) }
						</Button>
					</div>
				</div>
			}
		/>
	);
}

export default LaunchSiteComponent;
