import { StepperInternal } from '@automattic/data-stores';
import React from 'react';
import { StepperTracksEventStepNavigation } from '../../types';

/**
 * This is the return type of useStepNavigation hook
 */
export type NavigationControls = {
	/**
	 * Call this function if you want to go to the previous step.
	 *
	 * Please don't change the type of this function to add parameters. Passing data should strictly happen through the `submit` function.
	 * See why here: pdDR7T-KR-p2#steps-should-only-submit
	 */
	goBack?: () => void;

	/**
	 * Call this function if you want to go to the proceed down the flow.
	 * @deprecated Avoid this method. Use submit() instead.
	 */
	goNext?: () => void;

	/**
	 * Call this function if you want to jump to a certain step.
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

export type DeprecatedStepperStep = {
	/**
	 * The step slug is what appears as part of the pathname. Eg the intro in /setup/link-in-bio/intro
	 */
	slug: string;
	/**
	 * Does the step require a logged-in user?
	 */
	requiresLoggedInUser?: boolean;
	/**
	 * @deprecated Use asyncComponent instead. The component that will be rendered for this step. This variation is deprecated and will be removed in the future. Please use async loaded steps instead
	 *
	 * It should look like this: component: () => import( './internals/steps-repository/newsletter-setup' )
	 */
	component: React.FC< StepProps >;
};

export type AsyncStepperStep = {
	/**
	 * The step slug is what appears as part of the pathname. Eg the intro in /setup/link-in-bio/intro
	 */
	slug: string;
	/**
	 * Does the step require a logged-in user?
	 */
	requiresLoggedInUser?: boolean;
	/**
	 * The Async loaded component that will be rendered for this step
	 *
	 * It should look like this: component: () => import( './internals/steps-repository/newsletter-setup' )
	 */
	asyncComponent: () => Promise< { default: React.FC< StepProps > } >;
};

export type StepperStep = DeprecatedStepperStep | AsyncStepperStep;

export type Navigate< FlowSteps extends StepperStep[] > = (
	stepName: FlowSteps[ number ][ 'slug' ] | `${ FlowSteps[ number ][ 'slug' ] }?${ string }`,
	extraData?: any,
	/**
	 * If true, the current step will be replaced in the history stack.
	 */
	replace?: boolean
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

export type UseAssertConditionsHook< FlowSteps extends StepperStep[] > = (
	navigate?: Navigate< FlowSteps >
) => AssertConditionResult;

export type UseSideEffectHook< FlowSteps extends StepperStep[] > = (
	currentStepSlug: FlowSteps[ number ][ 'slug' ],
	navigate: Navigate< FlowSteps >
) => void;

export type Flow = {
	name: string;
	/**
	 * If this flow extends another flow, the variant slug will be added as a class name to the root element of the flow.
	 */
	variantSlug?: string;
	title?: string;
	classnames?: string | [ string ];
	/**
	 * Required flag to indicate if the flow is a signup flow.
	 */
	isSignupFlow: boolean;
	useSignupStartEventProps?: () => Record< string, string | number >;

	/**
	 *  You can use this hook to configure the login url.
	 * @returns An object describing the configuration.
	 * For now only extraQueryParams is supported.
	 */
	useLoginParams?: () => {
		/**
		 * A custom login path to use instead of the default login path.
		 */
		customLoginPath?: string;
		extraQueryParams?: Record< string, string | number >;
	};
	useSteps: UseStepsHook;
	useStepNavigation: UseStepNavigationHook< ReturnType< Flow[ 'useSteps' ] > >;
	useAssertConditions?: UseAssertConditionsHook< ReturnType< Flow[ 'useSteps' ] > >;
	/**
	 * A hook that is called in the flow's root at every render. You can use this hook to setup side-effects, call other hooks, etc..
	 */
	useSideEffect?: UseSideEffectHook< ReturnType< Flow[ 'useSteps' ] > >;
	/**
	 * Used for overriding the props recorded by the default/framework-handled Tracks event recorders.
	 * Can pass any properties that should be recorded for the event.
	 *   - Currently only applicable to step-navigation events.
	 */
	useTracksEventProps?: (
		event: StepperTracksEventStepNavigation
	) => Record< string, string | number | null > | undefined;
	/**
	 * Temporary hook to allow gradual migration of flows to the globalised/default event tracking.
	 * IMPORTANT: This hook will be removed in the future.
	 */
	use__Temporary__ShouldTrackEvent?: ( event: keyof NavigationControls ) => boolean;
};

export type StepProps = {
	navigation: NavigationControls;
	stepName: string;
	flow: string;
	/**
	 * If this is a step of a flow that extends another, pass the variantSlug of the variant flow, it can come handy.
	 */
	variantSlug?: string;
	data?: StepperInternal.State[ 'stepData' ];
	children?: React.ReactNode;
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
	active: boolean;
}

export interface PluginsResponse {
	plugins: Plugin[];
}

export interface FailureInfo {
	type: string;
	code: number | string;
	error: string;
}
