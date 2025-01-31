import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import StepProgress from '../step-progress';
import SignupContactForm from './contact-form';

import './style.scss';

const MultiStepForm = () => {
	const translate = useTranslate();
	const [ currentStep, setCurrentStep ] = useState( 1 );

	const steps = [
		{ label: translate( 'Sign up' ), isActive: currentStep === 1, isComplete: currentStep > 1 },
		{ label: translate( 'Personalize' ), isActive: currentStep === 2, isComplete: currentStep > 2 },
		{
			label: translate( 'Complete setup' ),
			isActive: currentStep === 3,
			isComplete: currentStep > 3,
		},
	];

	const currentForm = useMemo( () => {
		switch ( currentStep ) {
			case 1:
				return <SignupContactForm onContinue={ () => setCurrentStep( 2 ) } />;
			case 2:
				return <SignupContactForm onContinue={ () => setCurrentStep( 3 ) } />;
			case 3:
				return <div>Finish</div>;
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
