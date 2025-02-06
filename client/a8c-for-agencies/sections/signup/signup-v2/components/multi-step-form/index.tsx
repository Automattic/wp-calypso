import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import StepProgress from '../step-progress';
import BlueprintForm from './blueprint-form';
import ChoiceBlueprint from './choice-blueprint';
import SignupContactForm from './contact-form';
import FinishSignupSurvey from './finish-signup-survey';
import PersonalizationForm from './personalization';
import './style.scss';

const MultiStepForm = () => {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 1 );

	const steps = [
		{ label: translate( 'Sign up' ), isActive: currentStep === 1, isComplete: currentStep > 1 },
		{
			label: translate( 'Personalize' ),
			isActive: currentStep === 2 || currentStep === 3 || currentStep === 4,
			isComplete: currentStep > 2,
		},
		{
			label: translate( 'Finish survey' ),
			isActive: currentStep === 5,
			isComplete: currentStep > 5,
		},
	];

	const currentForm = useMemo( () => {
		switch ( currentStep ) {
			case 1:
				return <SignupContactForm onContinue={ () => setCurrentStep( 2 ) } />;
			case 2:
				return <PersonalizationForm onContinue={ () => setCurrentStep( 3 ) } />;
			case 3:
				return (
					<ChoiceBlueprint
						onContinue={ () => setCurrentStep( 4 ) }
						onSkip={ () => setCurrentStep( 5 ) }
					/>
				);
			case 4:
				return <BlueprintForm onContinue={ () => setCurrentStep( 5 ) } />;
			case 5:
				return <FinishSignupSurvey onContinue={ () => setCurrentStep( 6 ) } />;
			case 6:
				return <h1>Thank you!</h1>;
			default:
				return null;
		}
	}, [ currentStep ] );

	return (
		<div className="signup-multi-step-form">
			<StepProgress steps={ steps } />

			{ currentForm }
		</div>
	);
};

export default MultiStepForm;
