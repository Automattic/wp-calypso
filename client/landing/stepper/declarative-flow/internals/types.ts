import React from 'react';

/**
 * This is the return type of useStepNavigation hook
 */
export type NavigationControls = {
	/**
	 * Call this function if you want to go to the previous step.
	 *
	 * @deprecated Avoid this method. Use submit() instead.
	 * If you need to navigate back and forth between
	 * stepper screens, consider adding screen(s) to a new
	 * stepper flow and linking directly between flows/screens.
	 */
	goBack?: () => void;

	/**
	 * Call this function if you want to go to the proceed down the flow.
	 *
	 * @deprecated Avoid this method. Use submit() instead.
	 */
	goNext?: () => void;

	/**
	 * Call this function if you want to jump to a certain step.
	 *
	 * @deprecated Avoid this method. Use submit() instead.
	 * If you need to skip forward several screens in
	 * a stepper flow, handle that logic in submit().
	 * If you need to navigate backwards, consider adding
	 * screen(s) to a new stepper flow and linking directly
	 * between flows/screens.
	 */
	goToStep?: ( step: string ) => void;
	/**
	 * Submits the answers provided in the flow
	 */
	submit?: ( providedDependencies?: ProvidedDependencies, ...params: string[] ) => void;

	/**
	 * Exits the flow and continue to the given path
	 */
	exitFlow?: ( to: string ) => void;
};

export type StepperStep = {
	/**
	 * The step slug is what appears as part of the pathname. Eg the intro in /setup/link-in-bio/intro
	 */
	slug: string;
	/**
	 * The component that will be rendered for this step
	 */
	component: () => Promise< { default: React.FC< StepProps > } >;
};

export type Navigate< FlowSteps extends StepperStep[] > = (
	stepName: FlowSteps[ number ][ 'slug' ] | `${ FlowSteps[ number ][ 'slug' ] }?${ string }`,
	extraData?: any
) => void;

/**
 * This is the return type of useSteps hook
 */
export type UseStepsHook = () => StepperStep[];

export type UseStepNavigationHook< FlowSteps extends StepperStep[] > = (
	currentStepSlug: FlowSteps[ number ][ 'slug' ],
	navigate: Navigate< FlowSteps >,
	steps?: FlowSteps[ number ][ 'slug' ][]
) => NavigationControls;

export type UseAssertConditionsHook = () => AssertConditionResult;

export type UseSideEffectHook< FlowSteps extends StepperStep[] > = (
	currentStepSlug: FlowSteps[ number ][ 'slug' ],
	navigate: Navigate< FlowSteps >
) => void;

export type Flow = {
	name: string;
	title?: string;
	classnames?: string | [ string ];
	useSteps: UseStepsHook;
	useStepNavigation: UseStepNavigationHook< ReturnType< Flow[ 'useSteps' ] > >;
	useAssertConditions?: UseAssertConditionsHook;
	/**
	 * A hook that is called in the flow's root at every render. You can use this hook to setup side-effects, call other hooks, etc..
	 */
	useSideEffect?: UseSideEffectHook< ReturnType< Flow[ 'useSteps' ] > >;
};

export type StepProps = {
	navigation: NavigationControls;
	stepName: string;
	flow: string | null;
	data?: Record< string, unknown >;
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

export interface Plugin {
	slug: string;
}

export interface PluginsResponse {
	plugins: Plugin[];
}

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
}
