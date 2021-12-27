import { Button } from '@wordpress/components';
import { check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import './style.scss';

function P2EmailConfirmed( {
	flowName,
	goToNextStep,
	stepName,
	submitSignupStep,
	positionInFlow,
} ) {
	const translate = useTranslate();

	const handleNextStepClick = ( option ) => {
		submitSignupStep( {
			stepName,
			option,
		} );

		goToNextStep();
	};

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerIcon={ check }
			headerText={ translate( 'Email confirmed' ) }
		>
			<div className="p2-email-confirmed">
				<div className="p2-email-confirmed__message">
					{ translate(
						"Thanks for confirming your email address. Your account is now active. We're almost finished!"
					) }
				</div>
				<Button
					className="p2-email-confirmed__continue"
					isPrimary={ true }
					onClick={ handleNextStepClick }
				>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</P2StepWrapper>
	);
}

export default P2EmailConfirmed;
