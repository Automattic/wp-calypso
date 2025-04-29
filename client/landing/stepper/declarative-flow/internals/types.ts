import { StepperInternal } from '@automattic/data-stores';
import React from 'react';
import { STEPPER_TRACKS_EVENTS } from '../../constants';
import { PRIVATE_STEPS, STEPS } from './steps';
import type { Store } from 'redux';

/**
 * This is the return type of useStepNavigation hook
 * @template StepSubmittedTypes - The types of the step submitted data.
 * @example
 * navigation.submit({
 *   siteSlug: 'example.wordpress.com',
 *   siteTitle: 'Example Site',
 * });
 */
export interface BaseNavigationControls {
	/**
	 * @deprecated
	 * YOU DON'T NEED THIS. Most flows don't need this since #101550.
	 * Stepper now takes care of navigating the user back to the previous step based on their navigation history. It will handle non-linearity perfectly.
	 *
	 * If you define this method to behave in non-standard ways, its behavior will be at odds with the back button of the browser, which may create confusion.
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
	 * Exits the flow and continue to the given path
	 */
	exitFlow?: ( to: string ) => void;
}

export interface NavigationControls extends BaseNavigationControls {
	submit( providedDependencies?: ProvidedDependencies ): void;
}

export interface NavigationControlsWithSubmittedData< StepSubmittedTypes = unknown >
	extends BaseNavigationControls {
	/**
	 * Submits the answers provided in the flow. If it's complaining about the type, it means you haven't typed the step correctly.
	 * @see {@link client/landing/stepper/declarative-flow/internals/steps-repository/DEVELOPMENT/making-a-new-step.md}
	 */
	submit: (
		// This is the only way to allow steps to submit `{ data: 1 } | undefined`
		arg: StepSubmittedTypes extends undefined
			? undefined
			: StepSubmittedTypes & { shouldSkipSubmitTracking?: boolean }
	) => void;
}

export type AsyncStepperStep = ( typeof STEPS )[ keyof typeof STEPS ];
type AsyncUserStep = ( typeof PRIVATE_STEPS )[ keyof typeof PRIVATE_STEPS ];

export type StepperStep = ( AsyncStepperStep | AsyncUserStep ) & {
	requiresLoggedInUser?: boolean;
};

/**
 * Navigates to a step in the current flow. Preserves the current query params.
 * @param stepName - The name of the step to navigate to.
 * @param extraData - Extra data to pass to the step.
 * @param replace - If true, the current step will be replaced in the history stack.
 */
export type Navigate = (
	stepName: string,
	extraData?: any,
	/**
	 * If true, the current step will be replaced in the history stack.
	 */
	replace?: boolean
) => void;

/**
 * Navigates to a step in the current flow. Preserves the current query params.
 * @param stepName - The name of the step to navigate to.
 * @param extraData - Extra data to pass to the step.
 * @param replace - If true, the current step will be replaced in the history stack.
 */
export type NavigateV2< FlowSteps extends StepperStep[] > = (
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
	navigate: Navigate
) => NavigationControls;

export type UseStepNavigationHookV2< FlowSteps extends StepperStep[] > = (
	currentStepSlug: FlowSteps[ number ][ 'slug' ],
	navigate: NavigateV2< FlowSteps >
) => {
	/**
	 * Submits the answers provided in the flow. If it's complaining about the type, it means you haven't typed the step correctly.
	 * @see {@link client/landing/stepper/declarative-flow/internals/steps-repository/DEVELOPMENT/making-a-new-step.md}
	 */
	submit: SubmitHandler< () => FlowSteps >;
};

export type SubmitHandler< InitializeFunction extends DefaultFlowStepsConfig > = (
	submittedStep: MapStepToItsSubmitData< Awaited< ReturnType< InitializeFunction > >[ number ] >
) => /* return unknown, not void, to activate type checks against function params */ unknown;
/**
 * This type is complex because it's tricky to keep the mapping between slug and the steps submitted data type.
 * Without this, TS would have a SLUG <=> SUBMITTED_TYPE mapping, between every slug and every type of submitted data.
 * We only want a SLUG <=> SUBMITTED_TYPE mapping, between every slug and the type of the submitted data for the respective step.
 */
type MapStepToItsSubmitData< T extends StepperStep > = {
	[ K in T as K[ 'slug' ] ]: Pick< K, 'slug' > & {
		providedDependencies: Parameters<
			Parameters<
				Awaited< ReturnType< K[ 'asyncComponent' ] > >[ 'default' ]
			>[ 0 ][ 'navigation' ][ 'submit' ]
		>[ 0 ];
	};
}[ T[ 'slug' ] ];

export type UseAssertConditionsHook = ( navigate?: Navigate ) => AssertConditionResult;

export type UseSideEffectHook< FlowSteps extends StepperStep[] > = (
	currentStepSlug: FlowSteps[ number ][ 'slug' ],
	navigate: Navigate
) => void;

/**
 * Used for overriding props recorded by the default Tracks event loggers.
 * Can pass any properties that should be recorded for the respective events.
 */
export type UseTracksEventPropsHook = () => {
	/**
	 * This flag is needed to indicate that the custom props are still loading. And the return value will be ignored until it's false.
	 */
	isLoading?: boolean;
	eventsProperties: Partial<
		Record< ( typeof STEPPER_TRACKS_EVENTS )[ number ], Record< string, string | number | null > >
	>;
};

/**
 * @deprecated Use FlowV2 instead.
 */
export type Flow = {
	/**
	 * If this flag is set to true, the flow will login the user without leaving Stepper.
	 */
	__experimentalUseBuiltinAuth?: boolean;
	/**
	 * If this flag is set to true, the flow will use sessions to store the user's progress.
	 */
	__experimentalUseSessions?: boolean;
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
	/**
	 * @deprecated use `initialize` method instead.
	 */
	useSteps: UseStepsHook;
	/**
	 * Use this method to define the steps of the flow and do any actions that need to run before the flow starts.
	 * This hook is called only once when the flow is mounted. It can be asynchronous if you would like to load an experiment or other data.
	 */
	useStepNavigation: UseStepNavigationHook< StepperStep[] >;
	/**
	 * @deprecated Use `initialize` instead. `initialize` will run before the flow is rendered and you can make any decisions there.
	 */
	useAssertConditions?: UseAssertConditionsHook;
	/**
	 * A hook that is called in the flow's root at every render. You can use this hook to setup side-effects, call other hooks, etc..
	 */
	useSideEffect?: UseSideEffectHook< StepperStep[] >;
	useTracksEventProps?: UseTracksEventPropsHook;
};

/**
 * @deprecated Use FlowV2 instead.
 */
export type FlowV1 = Flow;

type DefaultFlowStepsConfig = ( reduxStore: Store ) => StepperStep[] | Promise< StepperStep[] >;

export interface FlowV2< FlowStepsInitialize extends DefaultFlowStepsConfig > {
	/**
	 * If this flag is set to true, the flow will login the user without leaving Stepper.
	 */
	__experimentalUseBuiltinAuth?: boolean;
	/**
	 * If this flag is set to true, the flow will use sessions to store the user's progress.
	 */
	__experimentalUseSessions?: boolean;
	/**
	 * The steps of the flow. **Please don't use this variable unless absolutely necessary**. It's meant to be used internally by the Stepper.
	 * Use `getSteps` instead.
	 */
	__flowSteps?: ReturnType< FlowStepsInitialize >;

	/**
	 * Use this method to retrieve the steps of the flow.
	 */
	getSteps?(): ReturnType< FlowStepsInitialize >;

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
	/**
	 * Use this method to define the steps of the flow and do any actions that need to run before the flow starts.
	 * This hook is called only once when the flow is mounted. It can be asynchronous if you would like to load an experiment or other data.
	 */
	initialize: FlowStepsInitialize;

	useStepNavigation: UseStepNavigationHookV2< Awaited< ReturnType< FlowStepsInitialize > > >;
	/**
	 * A hook that is called in the flow's root at every render. You can use this hook to setup side-effects, call other hooks, etc..
	 */
	useSideEffect?: UseSideEffectHook< Awaited< ReturnType< FlowStepsInitialize > > >;
	useTracksEventProps?: UseTracksEventPropsHook;
	/**
	 * @deprecated Use `initialize` instead. `initialize` will run before the flow is rendered and you can make any decisions there.
	 */
	useAssertConditions?: UseAssertConditionsHook;
}

/**
 * This is a helper type to intersect A and B only if B is not never. Intersecting with never results in never which is not what we want.
 */
type ConditionalIntersection< TA, TB > = [ TB ] extends [ never ] ? TA : TA & TB;

type HasProperty< T, K extends string > = K extends keyof T ? true : false;

/**
 * This is the type of the props passed to the step.
 * @template StepDataShape - The types of the step submitted data.
 * @example
 * const step = ( props: StepProps< { submits: { siteSlug: string } } > ) => {
 *   return <div>{ props.navigation.submit( { siteSlug: 'example.wordpress.com' } ) }</div>;
 * };
 */
export type StepProps< StepDataShape extends StepPropTypes = object > = ConditionalIntersection<
	{
		navigation: HasProperty< StepDataShape, 'submits' > extends false
			? NavigationControls
			: NavigationControlsWithSubmittedData< StepDataShape[ 'submits' ] >;
		stepName: string;
		flow: string;
		/**
		 * If this is a step of a flow that extends another, pass the variantSlug of the variant flow, it can come handy.
		 */
		variantSlug?: string;
		data?: StepperInternal.State[ 'stepData' ];
		children?: React.ReactNode;
		/**
		 * These two prop are used internally by the Stepper to redirect the user from the user step.
		 */
		redirectTo?: string;
		signupUrl?: string;
	},
	StepDataShape[ 'accepts' ]
>;

/**
 * This is the type of the step submitted and accepted props.
 * @example
 * const step: Step< { submits: { newUserName: string }, accepts: { userName: string } } > ) => {
 *   return (
 *     <div>
 *       <h1>Hi {userName}!</h1>
 *       <input onChange={ value => props.navigation.submit( { newUserName: value } ) } />
 *     </div>
 */
type StepPropTypes = {
	readonly submits?: Record< string, unknown >;
	readonly accepts?: Record< string, unknown >;
};

/**
 * This is the type of the step component.
 * @template ConfiguredStepPropTypes - The types of the step submitted and accepted props.
 * @example
 * const step: Step< { submits: { newUserName: string }, accepts: { userName: string } } > ) => {
 *   return (
 *     <div>
 *       <h1>Hi {userName}!</h1>
 *       <input onChange={ value => props.navigation.submit( { newUserName: value } ) } />
 *     </div>
 *   );
 * };
 */
export type Step< ConfiguredStepPropTypes extends StepPropTypes = object > =
	keyof ConfiguredStepPropTypes extends keyof StepPropTypes
		? React.FC< StepProps< ConfiguredStepPropTypes > >
		: // Only allow `accept` and `submits` config props.
		  never;

// TODO: get rid of these. Every type should be specific.
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
