import type { StepPath } from './steps-repository';

/**
 * This is the return type of useStepNavigation hook
 */
export type NavigationControls = {
	/**
	 * Call this function if you want to go to the previous step.
	 */
	goBack: () => void;
	/**
	 * Call this function if you want to go to the proceed down the flow.
	 */
	goNext: () => void;
	/**
	 * Call this function if you want to jump to a certain step.
	 */
	goToStep?: ( step: StepPath ) => void;
	/**
	 * Submits the answers provided in the flow
	 */
	submit?: () => void;
};

/**
 * This is the return type of useSteps hook
 */
export type UseStepHook = () => StepPath[];

export type UseStepNavigationHook = (
	currentStep: StepPath,
	navigate: ( stepName: StepPath ) => void,
	steps?: StepPath[]
) => NavigationControls;

export type Flow = {
	useSteps: UseStepHook;
	useStepNavigation: UseStepNavigationHook;
};

export type StepProps = {
	navigation: NavigationControls;
};

export type Step = React.FC< StepProps >;
