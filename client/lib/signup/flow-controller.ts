/**
 * External dependencies
 */
import {
	defer,
	difference,
	filter,
	find,
	flatMap,
	forEach,
	get,
	includes,
	isEmpty,
	keys,
	pick,
	reject,
	reduce,
} from 'lodash';
import page from 'page';
import { Store, Unsubscribe as ReduxUnsubscribe } from 'redux';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import flows from 'signup/config/flows';
import untypedSteps from 'signup/config/steps';
import wpcom from 'lib/wp';
import { getStepUrl } from 'signup/utils';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { ProgressState } from 'state/signup/progress/schema';
import { getSignupProgress } from 'state/signup/progress/selectors';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { resetSignup, updateDependencies } from 'state/signup/actions';
import { completeSignupStep, invalidateStep, processStep } from 'state/signup/progress/actions';

interface Dependencies {
	[ other: string ]: any;
}

interface Flow {
	destination: string | ( ( dependencies: Dependencies ) => string );
	providesDependenciesInQuery?: string[];
	steps: string[];
}

interface Step {
	apiRequestFunction?: (
		callback: ( errors: any, providedDependencies: Dependencies ) => void,
		dependenciesFound: Dependencies,
		step: Step,
		reduxStore: Store
	) => void;
	delayApiRequestUntilComplete?: boolean;
	dependencies?: string[];
	providedDependencies?: string[];
	providesDependencies?: string[];
	optionalDependencies?: string[];
	providesToken?: boolean;
	stepName: string;
}

const steps: Record< string, Step > = untypedSteps;

function progressStoreListener(
	reduxStore: Store,
	callback: ( nextState: ProgressState ) => void
) {
	let prevState = getSignupProgress( reduxStore.getState() );
	return () => {
		const nextState = getSignupProgress( reduxStore.getState() );
		if ( nextState !== prevState ) {
			prevState = nextState;
			callback( nextState );
		}
	};
}

type OnCompleteCallback = ( dependencies: Dependencies, destination: string ) => void;

interface SignupFlowControllerOptions {
	flowName: string;
	providedDependencies: Dependencies;
	reduxStore: Store;
	onComplete: OnCompleteCallback;
}

export default class SignupFlowController {
	_flow: Flow;
	_flowName: string;
	_onComplete: OnCompleteCallback;
	_processingSteps = new Set< string >();
	_reduxStore: Store;
	_unsubscribeStore?: ReduxUnsubscribe;

	constructor( options: SignupFlowControllerOptions ) {
		this._flow = flows.getFlow( options.flowName );
		this._flowName = options.flowName;
		this._onComplete = options.onComplete;
		this._reduxStore = options.reduxStore;

		this.changeFlowName( options.flowName );

		try {
			this._assertFlowHasValidDependencies();
		} catch ( ex ) {
			if ( this._flowName !== flows.defaultFlowName ) {
				// redirect to the default signup flow, hopefully it will be valid
				page( getStepUrl() );
				return;
			}
			throw ex;
		}

		this._unsubscribeStore = this._reduxStore.subscribe(
			progressStoreListener( this._reduxStore, this._process.bind( this ) )
		);

		this._resetStoresIfProcessing(); // reset the stores if the cached progress contained a processing step
		this._resetStoresIfUserHasLoggedIn(); // reset the stores if user has newly authenticated

		if ( this._flow.providesDependenciesInQuery ) {
			this._assertFlowProvidedDependenciesFromConfig( options.providedDependencies );
			this._reduxStore.dispatch( updateDependencies( options.providedDependencies ) );
		} else {
			// TODO: synces deps from progress to dep store: are they ever out of sync?
			const storedDependencies = this._getStoredDependencies();
			if ( ! isEmpty( storedDependencies ) ) {
				this._reduxStore.dispatch( updateDependencies( storedDependencies ) );
			}
		}
	}

	_resetStoresIfProcessing() {
		if ( find( getSignupProgress( this._reduxStore.getState() ), { status: 'processing' } ) ) {
			this.reset();
		}
	}

	_resetStoresIfUserHasLoggedIn() {
		if (
			isUserLoggedIn( this._reduxStore.getState() ) &&
			find( getSignupProgress( this._reduxStore.getState() ), { stepName: 'user' } )
		) {
			this.reset();
		}
	}

	_assertFlowProvidedDependenciesFromConfig( providedDependencies: Dependencies ) {
		const dependencyDiff = difference(
			this._flow.providesDependenciesInQuery,
			keys( providedDependencies )
		);
		if ( dependencyDiff.length > 0 ) {
			throw new Error(
				this._flowName +
					' did not provide the query dependencies [' +
					dependencyDiff +
					'] it is configured to.'
			);
		}
	}

	_assertFlowHasValidDependencies() {
		forEach( pick( steps, this._flow.steps ), ( step ) => {
			if ( ! step.dependencies ) {
				return;
			}

			const dependenciesFound = keys(
				pick( getSignupDependencyStore( this._reduxStore.getState() ), step.dependencies )
			);
			const dependenciesNotProvided = difference(
				step.dependencies,
				dependenciesFound,
				this._getFlowProvidesDependencies()
			);

			if ( dependenciesNotProvided.length > 0 ) {
				throw new Error(
					'The ' +
						step.stepName +
						' step requires dependencies [' +
						dependenciesNotProvided +
						'] which ' +
						'are not provided in the ' +
						this._flowName +
						' flow and are not already present in the store.'
				);
			}
		} );
	}

	_assertFlowProvidedRequiredDependencies() {
		const storedDependencies = keys( getSignupDependencyStore( this._reduxStore.getState() ) );

		forEach( pick( steps, this._flow.steps ), ( step ) => {
			if ( ! step.providesDependencies ) {
				return;
			}

			const optionalDependencies = step.optionalDependencies || [];

			const dependenciesNotProvided = difference(
				step.providesDependencies,
				optionalDependencies,
				storedDependencies
			);

			if ( dependenciesNotProvided.length > 0 ) {
				throw new Error(
					'The dependencies [' +
						dependenciesNotProvided +
						'] were listed as provided by the ' +
						step.stepName +
						' step but were not provided by it [ current flow: ' +
						this._flowName +
						' ].'
				);
			}
		} );
	}

	_canMakeAuthenticatedRequests() {
		return wpcom.isTokenLoaded() || isUserLoggedIn( this._reduxStore.getState() );
	}

	/**
	 * Returns a list of the dependencies provided in the flow configuration.
	 *
	 * @returns {Array} a list of dependency names
	 */
	_getFlowProvidesDependencies() {
		return flatMap(
			this._flow.steps,
			( stepName ) => ( steps && steps[ stepName ] && steps[ stepName ].providesDependencies ) || []
		).concat( this._flow.providesDependenciesInQuery || [] );
	}

	_process() {
		const currentSteps = this._flow.steps;
		const signupProgress = filter( getSignupProgress( this._reduxStore.getState() ), ( step ) =>
			includes( currentSteps, step.stepName )
		);
		const pendingSteps = filter( signupProgress, { status: 'pending' } );
		const completedSteps = filter( signupProgress, { status: 'completed' } );
		const dependencies = getSignupDependencyStore( this._reduxStore.getState() );

		if ( dependencies.bearer_token && ! wpcom.isTokenLoaded() ) {
			wpcom.loadToken( dependencies.bearer_token );
		}

		for ( const pendingStep of pendingSteps ) {
			this._processStep( pendingStep );
		}

		if ( completedSteps.length === currentSteps.length && undefined !== this._onComplete ) {
			this._assertFlowProvidedRequiredDependencies();
			// deferred to ensure that the onComplete function is called after the stores have
			// emitted their final change events.
			defer( () => this._onComplete( dependencies, this._destination( dependencies ) ) );
		}
	}

	_canProcessStep( step: Step ) {
		const { providesToken } = steps[ step.stepName ];
		const dependencies = get( steps, [ step.stepName, 'dependencies' ], [] );
		const dependenciesFound = pick(
			getSignupDependencyStore( this._reduxStore.getState() ),
			dependencies
		);
		const dependenciesSatisfied = dependencies.length === keys( dependenciesFound ).length;
		const currentSteps = this._flow.steps;
		const signupProgress = filter(
			getSignupProgress( this._reduxStore.getState() ),
			( { stepName } ) => includes( currentSteps, stepName )
		);
		const allStepsSubmitted =
			reject( signupProgress, { status: 'in-progress' } ).length === currentSteps.length;

		return (
			dependenciesSatisfied &&
			( providesToken || this._canMakeAuthenticatedRequests() ) &&
			( ! steps[ step.stepName ].delayApiRequestUntilComplete || allStepsSubmitted )
		);
	}

	_processStep( step: Step ) {
		if ( this._processingSteps.has( step.stepName ) || ! this._canProcessStep( step ) ) {
			return;
		}

		this._processingSteps.add( step.stepName );

		const dependencies = get( steps, [ step.stepName, 'dependencies' ], [] );
		const dependenciesFound = pick(
			getSignupDependencyStore( this._reduxStore.getState() ),
			dependencies
		);

		/*
			AB Test: passwordlessSignup

			`isPasswordlessSignupForm` is set by the PasswordlessSignupForm.

			We are testing whether a passwordless account creation and login improves signup rate in the `onboarding` flow.
			For passwordless signups, the API call has already occurred in the PasswordlessSignupForm, so here it is skipped.
		*/
		if ( get( step, 'isPasswordlessSignupForm' ) ) {
			this._processingSteps.delete( step.stepName );
			recordTracksEvent( 'calypso_signup_actions_complete_step', {
				step: step.stepName,
			} );
			this._reduxStore.dispatch( completeSignupStep( step, dependenciesFound ) );
			return;
		}

		// deferred because a step can be processed as soon as it is submitted
		defer( () => {
			this._reduxStore.dispatch( processStep( step ) );
		} );

		const apiFunction = steps[ step.stepName ].apiRequestFunction;
		if ( ! apiFunction ) {
			return;
		}

		apiFunction(
			( errors, providedDependencies ) => {
				this._processingSteps.delete( step.stepName );

				if ( errors ) {
					this._reduxStore.dispatch( invalidateStep( step, errors ) );
				} else {
					recordTracksEvent( 'calypso_signup_actions_complete_step', {
						step: step.stepName,
						flow: this._flowName,
					} );
					this._reduxStore.dispatch( completeSignupStep( step, providedDependencies ) );
				}
			},
			dependenciesFound,
			step,
			this._reduxStore
		);
	}

	_destination( dependencies: Dependencies ): string {
		if ( typeof this._flow.destination === 'function' ) {
			return this._flow.destination( dependencies );
		}

		return this._flow.destination;
	}

	_getStoredDependencies() {
		const requiredDependencies = flatMap(
			this._flow.steps,
			( stepName ) => ( steps && steps[ stepName ] && steps[ stepName ].providesDependencies ) || []
		);

		return reduce(
			getSignupProgress( this._reduxStore.getState() ),
			( current, step ) => ( {
				...current,
				...pick( step.providedDependencies, requiredDependencies ),
			} ),
			{}
		);
	}

	reset() {
		this._reduxStore.dispatch( resetSignup() );
	}

	cleanup() {
		this._unsubscribeStore && this._unsubscribeStore();
	}

	changeFlowName( flowName: string ) {
		flows.resetExcludedSteps();
		this._flowName = flowName;
		this._flow = flows.getFlow( flowName );
	}
}
