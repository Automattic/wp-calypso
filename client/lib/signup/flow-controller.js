/** @format */
/**
 * External dependencies
 */
import {
	assign,
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
} from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import flows from 'signup/config/flows';
import steps from 'signup/config/steps';
import wpcom from 'lib/wp';
import { getStepUrl } from 'signup/utils';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { getSignupProgress } from 'state/signup/progress/selectors';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { resetSignup, updateDependencies } from 'state/signup/actions';
import {
	completeStep,
	invalidateStep,
	processStep,
	removeUnneededSteps,
} from 'state/signup/progress/actions';

function progressStoreListener( reduxStore, callback ) {
	let prevState = getSignupProgress( reduxStore.getState() );
	return () => {
		const nextState = getSignupProgress( reduxStore.getState() );
		if ( nextState !== prevState ) {
			prevState = nextState;
			callback( nextState );
		}
	};
}

function SignupFlowController( options ) {
	if ( ! ( this instanceof SignupFlowController ) ) {
		return new SignupFlowController( options );
	}

	this._onComplete = options.onComplete;
	this._processingSteps = new Set();

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

assign( SignupFlowController.prototype, {
	_resetStoresIfProcessing: function() {
		if ( find( getSignupProgress( this._reduxStore.getState() ), { status: 'processing' } ) ) {
			this.reset();
		}
	},

	_resetStoresIfUserHasLoggedIn: function() {
		if (
			isUserLoggedIn( this._reduxStore.getState() ) &&
			find( getSignupProgress( this._reduxStore.getState() ), { stepName: 'user' } )
		) {
			this.reset();
		}
	},

	_assertFlowProvidedDependenciesFromConfig: function( providedDependencies ) {
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
	},

	_assertFlowHasValidDependencies: function() {
		forEach( pick( steps, this._flow.steps ), step => {
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
	},

	_assertFlowProvidedRequiredDependencies: function() {
		const storedDependencies = keys( getSignupDependencyStore( this._reduxStore.getState() ) );

		forEach( pick( steps, this._flow.steps ), step => {
			if ( ! step.providesDependencies ) {
				return;
			}

			const dependenciesNotProvided = difference( step.providesDependencies, storedDependencies );

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
	},

	_canMakeAuthenticatedRequests: function() {
		return wpcom.isTokenLoaded() || isUserLoggedIn( this._reduxStore.getState() );
	},

	/**
	 * Returns a list of the dependencies provided in the flow configuration.
	 *
	 * @return {array} a list of dependency names
	 */
	_getFlowProvidesDependencies: function() {
		return flatMap( this._flow.steps, stepName =>
			get( steps, [ stepName, 'providesDependencies' ], [] )
		).concat( this._flow.providesDependenciesInQuery );
	},

	_process: function() {
		const currentSteps = this._flow.steps;
		const signupProgress = filter( getSignupProgress( this._reduxStore.getState() ), step =>
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
	},

	_canProcessStep: function( step ) {
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
	},

	_processStep: function( step ) {
		if ( this._processingSteps.has( step.stepName ) || ! this._canProcessStep( step ) ) {
			return;
		}

		this._processingSteps.add( step.stepName );

		const dependencies = get( steps, [ step.stepName, 'dependencies' ], [] );
		const dependenciesFound = pick(
			getSignupDependencyStore( this._reduxStore.getState() ),
			dependencies
		);

		// deferred because a step can be processed as soon as it is submitted
		defer( () => {
			this._reduxStore.dispatch( processStep( step ) );
		} );

		const apiFunction = steps[ step.stepName ].apiRequestFunction;
		apiFunction(
			( errors, providedDependencies ) => {
				this._processingSteps.delete( step.stepName );
				analytics.tracks.recordEvent( 'calypso_signup_actions_complete_step', {
					step: step.stepName,
				} );

				if ( errors ) {
					this._reduxStore.dispatch( invalidateStep( step, errors ) );
				} else {
					this._reduxStore.dispatch( completeStep( step, providedDependencies ) );
				}
			},
			dependenciesFound,
			step,
			this._reduxStore
		);
	},

	_destination: function( dependencies ) {
		if ( typeof this._flow.destination === 'function' ) {
			return this._flow.destination( dependencies );
		}

		return this._flow.destination;
	},

	_getStoredDependencies() {
		const requiredDependencies = flatMap( this._flow.steps, stepName =>
			get( steps, [ stepName, 'providesDependencies' ], [] )
		);

		return getSignupProgress( this._reduxStore.getState() ).reduce(
			( current, step ) => ( {
				...current,
				...pick( step.providedDependencies, requiredDependencies ),
			} ),
			{}
		);
	},

	reset() {
		this._reduxStore.dispatch( resetSignup() );
	},

	cleanup() {
		this._unsubscribeStore && this._unsubscribeStore();
	},

	changeFlowName( flowName ) {
		this._flowName = flowName;
		this._flow = flows.getFlow( flowName );
		this._reduxStore.dispatch( removeUnneededSteps( this._flowName ) );
	},
} );

export default SignupFlowController;
