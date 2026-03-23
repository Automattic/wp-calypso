import { getStepFromURL } from './get-flow-from-url';
import type { StepperStep } from '../declarative-flow/internals/types';

/**
 * Warms the webpack module cache for the current step's chunk so React.lazy
 * resolves instantly. Complements usePreloadSteps which only covers future steps.
 */
export function preloadCurrentStep( flowSteps: readonly StepperStep[], pathname: string ): void {
	const stepSlug = getStepFromURL( pathname );

	if ( ! stepSlug ) {
		return;
	}

	const currentStep = flowSteps.find( ( s ) => s.slug === stepSlug );

	if ( currentStep ) {
		currentStep.asyncComponent();
	}
}
