/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
/**
 * Internal dependencies
 */
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import './style.scss';

function P2ConfirmEmail( { flowName, stepName, positionInFlow } ) {
	const translate = useTranslate();
	const userEmail = useSelector( getCurrentUserEmail );
	const mail = (
		<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M30.0003 11.25H10.0003C8.84973 11.25 7.91699 12.1827 7.91699 13.3333V26.6667C7.91699 27.8173 8.84973 28.75 10.0003 28.75H30.0003C31.1509 28.75 32.0837 27.8173 32.0837 26.6667V13.3333C32.0837 12.1827 31.1509 11.25 30.0003 11.25Z"
				stroke=""
				strokeWidth="1.5"
			/>
			<path d="M8.33301 11.666L19.9997 21.666L31.6663 11.666" stroke="" strokeWidth="1.5" />
		</svg>
	);

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerIcon={ mail }
			headerText={ translate( 'Check your email' ) }
		>
			<div className="p2-confirm-email">
				<div className="p2-confirm-email__message">
					{ translate(
						"We've sent an email with a verification link to {{strong}}%(email)s{{/strong}}. Please follow that link to confirm your email address and continue.",
						{
							args: { email: userEmail },
							components: { strong: <strong /> },
						}
					) }
				</div>
				<div className="p2-confirm-email__actions">
					<div className="p2-confirm-email__actions-text">
						{ translate( 'Are you having issues receiving it?' ) }
					</div>
					<div className="p2-confirm-email__buttons">
						<Button className="p2-confirm-email__resend-email" onClick={ () => {} }>
							{ translate( 'Resend the verification email' ) }
						</Button>
						<div className="p2-confirm-email__buttons-separator">or</div>
						<Button className="p2-confirm-email__change-email" onClick={ () => {} }>
							{ translate( 'Use a different email address' ) }
						</Button>
					</div>
				</div>
			</div>
		</P2StepWrapper>
	);
}

export default P2ConfirmEmail;
