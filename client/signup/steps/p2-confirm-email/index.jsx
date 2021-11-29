/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import './style.scss';

function P2ConfirmEmail( {
	flowName,
	stepName,
	positionInFlow,
	//submitSignupStep,
	//goToNextStep,
} ) {
	const translate = useTranslate();

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( 'Get started with P2' ) }
		>
			<div className="p2-confirm-email">{ translate( 'Under construction' ) }</div>
		</P2StepWrapper>
	);
}

export default P2ConfirmEmail;
