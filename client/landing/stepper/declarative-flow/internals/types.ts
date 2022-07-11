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
	goToStep?: ( step: StepPath | `${ StepPath }?${ string }` ) => void;
	/**
	 * Submits the answers provided in the flow
	 */
	submit?: ( providedDependencies?: ProvidedDependencies, ...params: string[] ) => void;
	/**
	 * Exits the flow and continue to the given path
	 */
	exitFlow?: ( to: string ) => void;
};

/**
 * This is the return type of useSteps hook
 */
export type UseStepHook = () => StepPath[];

export type UseStepNavigationHook = (
	currentStep: StepPath,
	navigate: ( stepName: StepPath | `${ StepPath }?${ string }` ) => void,
	steps?: StepPath[]
) => NavigationControls;

export type UseAssertConditionsHook = () => AssertConditionResult;

export type Flow = {
	name: string;
	classnames?: string | [ string ];
	useSteps: UseStepHook;
	useStepNavigation: UseStepNavigationHook;
	useAssertConditions?: UseAssertConditionsHook;
	/**
	 * A hook that is called in the flow's root at every render. You can use this hook to setup side-effects, call other hooks, etc..
	 */
	useSideEffect?: () => void;
};

export type StepProps = {
	navigation: NavigationControls;
	stepName?: string | null;
	flow: string | null;
};

export type Step = React.FC< StepProps >;

export type ProvidedDependencies = Record< string, unknown >;

export enum AssertConditionState {
	SUCCESS = 'success',
	FAILURE = 'failure',
	CHECKING = 'checking',
}

export type AssertConditionResult = {
	state: AssertConditionState;
	message?: string;
};
