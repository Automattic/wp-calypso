import { useHistory } from 'react-router-dom';
import { Step, usePath, useCurrentStep, StepType } from '../path';
import { useHeroSteps } from './use-hero-steps';

interface UseHeroStepNavigationResult {
	goBack: () => void;

	/**
	 * Proceed to the next step in the hero flow. Allows an explicit next step to
	 * be specified to enable "branching of the flow".
	 */
	goNext: ( explicitStep?: StepType ) => void;
}

/**
 * A React hook that returns callback to navigate to previous and next steps in Gutenboarding flow
 */
export function useHeroStepNavigation(): UseHeroStepNavigationResult {
	const makePath = usePath();
	const history = useHistory();
	const currentStep = useCurrentStep();

	const steps = useHeroSteps();

	const currentStepIndex = steps.findIndex( ( step ) => step === Step[ currentStep ] );

	const previousStepPath = currentStepIndex > 0 ? makePath( steps[ currentStepIndex - 1 ] ) : '';

	const handleBack = () => history.push( previousStepPath );
	const handleNext = ( explicitStep?: StepType ) => {
		let nextStepPath = '';

		if ( explicitStep ) {
			nextStepPath = makePath( explicitStep );
		} else if (
			currentStepIndex !== -1 && // check first if current step still exists
			currentStepIndex < steps.length - 1
		) {
			nextStepPath = makePath( steps[ currentStepIndex + 1 ] );
		}

		history.push( nextStepPath );
	};

	return {
		goBack: handleBack,
		goNext: handleNext,
	};
}
