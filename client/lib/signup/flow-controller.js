/** @format */
/**
 * External dependencies
 */
import {
	assign,
	compact,
	defer,
	difference,
	every,
	filter,
	find,
	flatten,
	get,
	isEmpty,
	keys,
	map,
	pick,
	reject,
} from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:signup:flow-controller' ); // eslint-disable-line no-unused-vars
import store from 'store';
import page from 'page';

/**
 * Internal dependencies
 */
import SignupActions from './actions';
import SignupProgressStore from './progress-store';
import SignupDependencyStore from './dependency-store';
import flows from 'signup/config/flows';
import steps from 'signup/config/steps';
import wpcom from 'lib/wp';
import userFactory from 'lib/user';
import { getStepUrl } from 'signup/utils';

/**
 * Constants
 */
const user = userFactory();
const STORAGE_KEY = 'signupFlowName';

function SignupFlowController( options ) {
	if ( ! ( this instanceof SignupFlowController ) ) {
		return new SignupFlowController( options );
	}

	this._flowName = options.flowName;
	this._flow = flows.getFlow( options.flowName );
	this._onComplete = options.onComplete;

	this._reduxStore = options.reduxStore;
	SignupProgressStore.setReduxStore( this._reduxStore );
	SignupDependencyStore.setReduxStore( this._reduxStore );

	this._processingSteps = {};

	this._assertFlowHasValidDependencies();

	SignupProgressStore.on( 'change', this._process.bind( this ) );

	if ( options.flowName === store.get( STORAGE_KEY ) ) {
		SignupActions.fetchCachedSignup( options.flowName );

		// reset the stores if the cached progress contained a processing step
		this._resetStoresIfProcessing();
		this._resetStoresIfUserHasLoggedIn();
	}

	if ( this._flow.providesDependenciesInQuery ) {
		this._assertFlowProvidedDependenciesFromConfig( options.providedDependencies );

		SignupActions.provideDependencies( options.providedDependencies );
	} else {
		const storedDependencies = this._getStoredDependencies();
		if ( ! isEmpty( storedDependencies ) ) {
			SignupActions.provideDependencies( storedDependencies );
		}
	}

	store.set( STORAGE_KEY, options.flowName );
}

assign( SignupFlowController.prototype, {
	_resetStoresIfProcessing: function() {
		if ( find( SignupProgressStore.get(), { status: 'processing' } ) ) {
			SignupProgressStore.reset();
			SignupDependencyStore.reset();
		}
	},

	_resetStoresIfUserHasLoggedIn: function() {
		if ( user.get() && find( SignupProgressStore.get(), { stepName: 'user' } ) ) {
			SignupProgressStore.reset();
			SignupDependencyStore.reset();
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
		return every(
			pick( steps, this._flow.steps ),
			function( step ) {
				if ( ! step.dependencies ) {
					return true;
				}

				const dependenciesFound = pick( SignupDependencyStore.get(), step.dependencies );
				const dependenciesNotProvided = difference(
					step.dependencies,
					keys( dependenciesFound ),
					this._getFlowProvidesDependencies()
				);
				if ( ! isEmpty( dependenciesNotProvided ) ) {
					if ( this._flowName !== flows.defaultFlowName ) {
						// redirect to the default signup flow, hopefully it will be valid
						page( getStepUrl() );
					}

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
				return true;
			}.bind( this )
		);
	},

	_assertFlowProvidedRequiredDependencies: function() {
		return every(
			pick( steps, this._flow.steps ),
			function( step ) {
				if ( ! step.providesDependencies ) {
					return true;
				}

				const dependenciesNotProvided = difference(
					step.providesDependencies,
					keys( SignupDependencyStore.get() )
				);
				if ( ! isEmpty( dependenciesNotProvided ) ) {
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
				return true;
			}.bind( this )
		);
	},

	_canMakeAuthenticatedRequests: function() {
		return wpcom.isTokenLoaded() || user.get();
	},

	/**
	 * Returns a list of the dependencies provided in the flow configuration.
	 *
	 * @return {array} a list of dependency names
	 */
	_getFlowProvidesDependencies: function() {
		return flatten(
			compact(
				map( this._flow.steps, function( step ) {
					return steps[ step ].providesDependencies;
				} )
			)
		).concat( this._flow.providesDependenciesInQuery );
	},

	_process: function() {
		let currentSteps = this._flow.steps,
			signupProgress = filter(
				SignupProgressStore.get(),
				step => -1 !== currentSteps.indexOf( step.stepName )
			),
			pendingSteps = filter( signupProgress, { status: 'pending' } ),
			completedSteps = filter( signupProgress, { status: 'completed' } ),
			bearerToken = SignupDependencyStore.get().bearer_token,
			dependencies = SignupDependencyStore.get();

		if ( bearerToken && ! wpcom.isTokenLoaded() ) {
			wpcom.loadToken( bearerToken );
		}

		if ( pendingSteps.length > 0 ) {
			map( pendingSteps, this._processStep.bind( this ) );
		}

		if ( completedSteps.length === currentSteps.length && undefined !== this._onComplete ) {
			if ( this._assertFlowProvidedRequiredDependencies() ) {
				// deferred to ensure that the onComplete function is called after the stores have
				// emitted their final change events.
				defer( () => {
					this._onComplete( dependencies, this._destination( dependencies ) );
				} );
			}
		}
	},

	_canProcessStep: function( step ) {
		const providesToken = steps[ step.stepName ].providesToken,
			dependencies = steps[ step.stepName ].dependencies || [],
			dependenciesFound = pick( SignupDependencyStore.get(), dependencies ),
			dependenciesSatisfied = dependencies.length === keys( dependenciesFound ).length,
			currentSteps = this._flow.steps,
			signupProgress = filter(
				SignupProgressStore.get(),
				_step => -1 !== currentSteps.indexOf( _step.stepName )
			),
			allStepsSubmitted =
				reject( signupProgress, {
					status: 'in-progress',
				} ).length === currentSteps.length;

		return (
			dependenciesSatisfied &&
			! this._processingSteps[ step.stepName ] &&
			( providesToken || this._canMakeAuthenticatedRequests() ) &&
			( ! steps[ step.stepName ].delayApiRequestUntilComplete || allStepsSubmitted )
		);
	},

	_processStep: function( step ) {
		const dependencies = steps[ step.stepName ].dependencies || [];
		const dependenciesFound = pick( SignupDependencyStore.get(), dependencies );

		if ( this._canProcessStep( step ) ) {
			this._processingSteps[ step.stepName ] = true;

			SignupActions.processSignupStep( step );

			const apiFunction = steps[ step.stepName ].apiRequestFunction;

			apiFunction(
				( errors, providedDependencies ) => {
					this._processingSteps[ step.stepName ] = false;
					SignupActions.processedSignupStep( step, errors, providedDependencies );
				},
				dependenciesFound,
				step,
				this._reduxStore
			);
		}
	},

	_destination: function( dependencies ) {
		if ( typeof this._flow.destination === 'function' ) {
			return this._flow.destination( dependencies );
		}

		return this._flow.destination;
	},

	_getStoredDependencies() {
		const requiredDependencies = this._flow.steps.reduce( ( current, stepName ) => {
			const providesDependencies = get( steps, [ stepName, 'providesDependencies' ] );
			return providesDependencies ? current.concat( providesDependencies ) : current;
		}, [] );

		return SignupProgressStore.get().reduce(
			( current, step ) => ( {
				...current,
				...pick( step.providedDependencies, requiredDependencies ),
			} ),
			{}
		);
	},

	shouldAutoContinue: function() {
		return !! this._flow.autoContinue;
	},

	reset() {
		SignupProgressStore.reset();
		SignupDependencyStore.reset();
	},

	changeFlowName( flowName ) {
		this._flowName = flowName;
		this._flow = flows.getFlow( flowName );
		store.set( STORAGE_KEY, flowName );
	},
} );

export default SignupFlowController;
