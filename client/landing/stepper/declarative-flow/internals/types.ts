import { StepperInternal } from '@automattic/data-stores';
import React from 'react';
import { STEPPER_TRACKS_EVENTS } from '../../constants';

/**
 * This is the return type of useStepNavigation hook
 * @template StepSubmittedTypes - The types of the step submitted data.
 * @example
 * navigation.submit({
 *   siteSlug: 'example.wordpress.com',
 *   siteTitle: 'Example Site',
 * });
 */
export type NavigationControls<
	StepSubmittedTypes extends unknown | undefined | never | Record< string, unknown > = undefined,
> = {
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
	 * Submits the answers provided in the flow. If it's complaining about the type, it means you haven't typed the step correctly.
	 * @see {@link client/landing/stepper/declarative-flow/internals/steps-repository/DEVELOPMENT/making-a-new-step.md}
	 */
	submit?: (
		providedDependencies?: StepSubmittedTypes extends Record< string, unknown >
			? StepSubmittedTypes
			: never
	) => void;

	/**
	 * Exits the flow and continue to the given path
	 */
	exitFlow?: ( to: string ) => void;
};

export type AsyncStepperStep = {
	/**
	 * The step slug is what appears as part of the pathname. Eg the intro in /setup/link-in-bio/intro
	 */
	slug: Exclude< string, 'user' >;
	/**
	 * Does the step require a logged-in user?
	 */
	requiresLoggedInUser?: boolean;
	/**
	 * The Async loaded component that will be rendered for this step
	 *
	 * It should look like this: component: () => import( './internals/steps-repository/newsletter-setup' )
	 */
	asyncComponent: () => Promise< { default: React.FC< any > } >;
};

export interface AsyncUserStep extends AsyncStepperStep {
	/**
	 * The step slug is what appears as part of the pathname. Eg the intro in /setup/link-in-bio/intro
	 */
	slug: 'user';
}

export type StepperStep = AsyncStepperStep | AsyncUserStep;

/**
 * Navigates to a step in the current flow. Preserves the current query params.
 * @param stepName - The name of the step to navigate to.
 * @param extraData - Extra data to pass to the step.
 * @param replace - If true, the current step will be replaced in the history stack.
 */
export type Navigate< FlowSteps extends readonly StepperStep[] > = (
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
export type UseStepsHook = () => readonly StepperStep[];

export type UseStepNavigationHook< FlowSteps extends StepperStep[] > = (
	currentStepSlug: FlowSteps[ number ][ 'slug' ],
	navigate: Navigate< FlowSteps >
) => NavigationControls< any >;

export type UseAssertConditionsHook< FlowSteps extends readonly StepperStep[] > = (
	navigate?: Navigate< FlowSteps >
) => AssertConditionResult;

export type UseSideEffectHook< FlowSteps extends readonly StepperStep[] > = (
	currentStepSlug: FlowSteps[ number ][ 'slug' ],
	navigate: Navigate< FlowSteps >
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
export type FlowV1 = {
	/**
	 * If this flag is set to true, the flow will login the user without leaving Stepper.
	 */
	__experimentalUseBuiltinAuth?: boolean;
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
	useAssertConditions?: UseAssertConditionsHook< ReturnType< FlowV1[ 'useSteps' ] > >;
	/**
	 * A hook that is called in the flow's root at every render. You can use this hook to setup side-effects, call other hooks, etc..
	 */
	useSideEffect?: UseSideEffectHook< ReturnType< FlowV1[ 'useSteps' ] > >;
	useTracksEventProps?: UseTracksEventPropsHook;
	/**
	 * Temporary hook to allow gradual migration of flows to the globalised/default event tracking.
	 * IMPORTANT: This hook will be removed in the future.
	 */
	use__Temporary__ShouldTrackEvent?: ( event: keyof NavigationControls ) => boolean;
};

export type FlowV2 = {
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
	__flowSteps?: readonly StepperStep[];

	/**
	 * Use this method to retrieve the steps of the flow.
	 */
	getSteps?(): readonly StepperStep[];

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
	 *
	 * Returning false will kill the app.
	 */
	initialize():
		| false
		| Promise< false >
		| Promise< readonly StepperStep[] >
		| readonly StepperStep[];
	useStepNavigation: UseStepNavigationHook< StepperStep[] >;
	/**
	 * A hook that is called in the flow's root at every render. You can use this hook to setup side-effects, call other hooks, etc..
	 */
	useSideEffect?: UseSideEffectHook< StepperStep[] >;
	useTracksEventProps?: UseTracksEventPropsHook;
	/**
	 * Temporary hook to allow gradual migration of flows to the globalised/default event tracking.
	 * IMPORTANT: This hook will be removed in the future.
	 */
	use__Temporary__ShouldTrackEvent?: ( event: keyof NavigationControls ) => boolean;
	/**
	 * @deprecated Avoid this. Assert your conditions in `initialize` instead unless you're 100% sure you need this.
	 */
	useAssertConditions?: UseAssertConditionsHook< ReturnType< FlowV1[ 'useSteps' ] > >;
};

export type Flow = FlowV1 | FlowV2;

/**
 * This is a helper type to intersect A and B only if B is not never. Intersecting with never results in never which is not what we want.
 */
type ConditionalIntersection< TA, TB > = [ TB ] extends [ never ] ? TA : TA & TB;

/**
 * This is the type of the props passed to the step.
 * @template StepDataShape - The types of the step submitted data.
 * @example
 * const step = ( props: StepProps< { submits: { siteSlug: string } } > ) => {
 *   return <div>{ props.navigation.submit( { siteSlug: 'example.wordpress.com' } ) }</div>;
 * };
 */
export type StepProps< StepDataShape extends StepPropTypes | never = never > =
	ConditionalIntersection<
		{
			navigation: NavigationControls< StepDataShape[ 'submits' ] >;
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
export type Step<
	ConfiguredStepPropTypes extends StepPropTypes = {
		submits: never;
		accepts: never;
	},
> = keyof ConfiguredStepPropTypes extends keyof StepPropTypes
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
