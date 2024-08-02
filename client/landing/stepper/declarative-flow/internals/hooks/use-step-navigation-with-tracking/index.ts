import { recordSubmitStep } from '../../analytics/record-submit-step';
import type { Flow, Navigate, ProvidedDependencies, StepperStep } from '../../types';

interface Params< FlowSteps extends StepperStep[] > {
	flow: Flow;
	currentStepRoute: string;
	navigate: Navigate< FlowSteps >;
	steps: StepperStep[];
}

export const useStepNavigationWithTracking = ( {
	flow,
	currentStepRoute,
	navigate,
	steps,
}: Params< ReturnType< Flow[ 'useSteps' ] > > ) => {
	const stepNavigation = flow.useStepNavigation(
		currentStepRoute,
		navigate,
		steps.map( ( step ) => step.slug )
	);

	const shouldTrackSubmit = flow.use__Temporary__ShouldTrackEvent?.( 'submit' ) ?? false;

	return {
		...stepNavigation,
		submit: ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
			shouldTrackSubmit &&
				recordSubmitStep( providedDependencies, '', flow.name, currentStepRoute );
			stepNavigation.submit?.( providedDependencies, ...params );
		},
	};
};
