import { Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { check } from '@wordpress/icons';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import './style.scss';

const debug = debugFactory( 'calypso:signup:p2-confirm-email' );

function P2ConfirmEmail( {
	flowName,
	goToNextStep,
	isEmailVerified,
	positionInFlow,
	stepName,
	submitSignupStep,
	refParameter,
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const userEmail = useSelector( getCurrentUserEmail );
	debug( 'User email: %s', userEmail );

	const [ emailResendCount, setEmailResendCount ] = useState( 0 );
	const EMAIL_RESEND_MAX = 3;

	const mailIcon = (
		<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M30.0003 11.25H10.0003C8.84973 11.25 7.91699 12.1827 7.91699 13.3333V26.6667C7.91699 27.8173 8.84973 28.75 10.0003 28.75H30.0003C31.1509 28.75 32.0837 27.8173 32.0837 26.6667V13.3333C32.0837 12.1827 31.1509 11.25 30.0003 11.25Z"
				stroke=""
				strokeWidth="1.5"
			/>
			<path d="M8.33301 11.666L19.9997 21.666L31.6663 11.666" stroke="" strokeWidth="1.5" />
		</svg>
	);

	// Remember that we loaded, not skipped, this step for the user.
	// We also need to store the original refParameter, as the redirect on email verification
	// loses it.
	useEffect( () => {
		if ( userEmail ) {
			dispatch(
				saveSignupStep( { stepName, ...( refParameter && { storedRefParameter: refParameter } ) } )
			);

			debug( 'Email confirmation step loaded for %s', userEmail );
		}
	}, [ userEmail, dispatch, stepName, refParameter ] );

	const handleResendEmailClick = () => {
		if ( emailResendCount >= EMAIL_RESEND_MAX ) {
			return;
		}

		recordTracksEvent( 'calypso_signup_p2_confirm_email_request_resend' );

		wpcom.req
			.post( {
				path: '/me/send-verification-email',
				body: {
					from: 'p2-signup',
				},
			} )
			.then( () => {
				setEmailResendCount( emailResendCount + 1 );
				dispatch(
					successNotice( translate( 'Verification email resent. Please check your inbox.' ) )
				);
			} )
			.catch( () => {
				dispatch( errorNotice( translate( 'Unable to resend email. Please try again later.' ) ) );
			} );
	};

	const handleNextStepClick = () => {
		debug( 'Email confirmation step completed for %s', userEmail );
		recordTracksEvent( 'calypso_signup_p2_confirm_email_step_submit' );
		submitSignupStep( { stepName } );

		goToNextStep();
	};

	const renderCheckEmailNotice = () => {
		return (
			<>
				<div className="p2-confirm-email__message">
					{ translate(
						"We've sent an email with a verification link to {{strong}}%(email)s{{/strong}}. Please follow that link to confirm your email address and continue.",
						{
							args: { email: userEmail },
							components: { strong: <strong /> },
						}
					) }
				</div>
				{ emailResendCount < EMAIL_RESEND_MAX && (
					<div className="p2-confirm-email__actions">
						<div className="p2-confirm-email__actions-text">
							{ translate( 'Are you having issues receiving it?' ) }
						</div>
						<div className="p2-confirm-email__buttons">
							<Button className="p2-confirm-email__resend-email" onClick={ handleResendEmailClick }>
								{ translate( 'Resend the verification email' ) }
							</Button>
						</div>
					</div>
				) }
			</>
		);
	};

	const renderPostConfirmationNotice = () => {
		return (
			<>
				<div className="p2-confirm-email__message">
					{ translate(
						"Thanks for confirming your email address. Your account is now active. We're almost finished!"
					) }
				</div>
				<div className="p2-confirm-email__buttons">
					<Button className="p2-confirm-email__continue" isPrimary onClick={ handleNextStepClick }>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			</>
		);
	};

	return (
		userEmail && (
			<P2StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerIcon={ isEmailVerified ? check : mailIcon }
				headerText={
					isEmailVerified ? translate( 'Email confirmed' ) : translate( 'Check your email' )
				}
				stepIndicator={ translate( 'Step %(currentStep)s of %(totalSteps)s', {
					args: {
						currentStep: 2,
						totalSteps: 3,
					},
				} ) }
			>
				<div className="p2-confirm-email">
					{ isEmailVerified ? renderPostConfirmationNotice() : renderCheckEmailNotice() }
				</div>
			</P2StepWrapper>
		)
	);
}

export default P2ConfirmEmail;
