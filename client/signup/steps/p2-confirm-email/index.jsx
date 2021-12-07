/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { inbox } from '@wordpress/icons';
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

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerIcon={ inbox }
			headerText={ translate( 'Check your email' ) }
		>
			<div className="p2-confirm-email">
				<div>
					{ translate(
						"We've sent an email with a verification link to {{strong}}%(email)s{{/strong}}. Please follow that link to confirm your email address and continue.",
						{
							args: { email: userEmail },
							components: { strong: <strong /> },
						}
					) }
				</div>
				<div>
					<Button className="p2-confirm-email__change-email" onClick={ () => {} }>
						{ translate( 'Use a different email address' ) }
					</Button>
				</div>
			</div>
		</P2StepWrapper>
	);
}

export default P2ConfirmEmail;
