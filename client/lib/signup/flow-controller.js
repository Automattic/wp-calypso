/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:signup:flow-controller' ), // eslint-disable-line no-unused-vars
	store = require( 'store' ),
	assign = require( 'lodash/assign' ),
	defer = require( 'lodash/defer' ),
	difference = require( 'lodash/difference' ),
	every = require( 'lodash/every' ),
	isEmpty = require( 'lodash/isEmpty' ),
	compact = require( 'lodash/compact' ),
	flatten = require( 'lodash/flatten' ),
	map = require( 'lodash/map' ),
	reject = require( 'lodash/reject' ),
	filter = require( 'lodash/filter' ),
	find = require( 'lodash/find' ),
	pick = require( 'lodash/pick' ),
	keys = require( 'lodash/keys' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var SignupActions = require( './actions' ),
	SignupProgressStore = require( './progress-store' ),
	SignupDependencyStore = require( './dependency-store' ),
	flows = require( 'signup/config/flows' ),
	steps = require( 'signup/config/steps' ),
	wpcom = require( 'lib/wp' ),
	user = require( 'lib/user' )(),
	utils = require( 'signup/utils' );

/**
 * Constants
 */
const STORAGE_KEY = 'signupFlowName';

function SignupFlowController( options ) {
	if ( ! ( this instanceof SignupFlowController ) ) {
		return new SignupFlowController( options );
	}

	this._flowName = options.flowName;
	this._flow = flows.getFlow( options.flowName );
	this._onComplete = options.onComplete;
	this._processingSteps = {};

	this._boundProcess = this._process.bind( this );

	this._assertFlowHasValidDependencies();

	this._reduxStore = options.reduxStore;

	SignupProgressStore.on( 'change', this._boundProcess );

	if ( options.flowName === store.get( STORAGE_KEY ) ) {
		SignupActions.fetchCachedSignup( options.flowName );

		// reset the stores if the cached progress contained a processing step
		this._resetStoresIfProcessing();
		this._resetStoresIfUserHasLoggedIn();
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

	_assertFlowHasValidDependencies: function() {
		return every( pick( steps, this._flow.steps ), function( step ) {
			var dependenciesNotProvided;
			if ( ! step.dependencies ) {
				return true;
			}

			const dependenciesFound = pick( SignupDependencyStore.get(), step.dependencies );
			dependenciesNotProvided = difference( step.dependencies, keys( dependenciesFound ), this._getFlowProvidesDependencies() );
			if ( ! isEmpty( dependenciesNotProvided ) ) {

				if ( this._flowName !== flows.defaultFlowName ) {
					// redirect to the default signup flow, hopefully it will be valid
					page( utils.getStepUrl() );
				}

				throw new Error( 'The ' + step.stepName + ' step requires dependencies [' + dependenciesNotProvided + '] which ' +
				'are not provided in the ' + this._flowName + ' flow and are not already present in the store.' );
			}
			return true;
		}.bind( this ) );
	},

	_assertFlowProvidedRequiredDependencies: function() {
		return every( pick( steps, this._flow.steps ), function( step ) {
			var dependenciesNotProvided;
			if ( ! step.providesDependencies ) {
				return true;
			}

			dependenciesNotProvided = difference( step.providesDependencies, keys( SignupDependencyStore.get() ) );
			if ( ! isEmpty( dependenciesNotProvided ) ) {
				throw new Error( 'The dependencies [' + dependenciesNotProvided + '] were listed as provided by the ' + step.stepName +
				' step but were not provided by it [ current flow: ' + this._flowName + ' ].' );
			}
			return true;
		}.bind( this ) );
	},

	_canMakeAuthenticatedRequests: function() {
		return wpcom.isTokenLoaded() || user.get();
	},

	_getFlowProvidesDependencies: function() {
		return flatten( compact( map( this._flow.steps, function( step ) {
			return steps[ step ].providesDependencies;
		} ) ) );
	},

	_process: function() {
		var signupProgress = SignupProgressStore.get(),
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

		if ( completedSteps.length === this._flow.steps.length && undefined !== this._onComplete ) {
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
			allStepsSubmitted = reject( SignupProgressStore.get(), {
				status: 'in-progress'
			} ).length === this._flow.steps.length;

		return dependenciesSatisfied &&
			! this._processingSteps[ step.stepName ] &&
			( providesToken || this._canMakeAuthenticatedRequests() ) &&
			( ! steps[ step.stepName ].delayApiRequestUntilComplete || allStepsSubmitted );
	},

	_processStep: function( step ) {
		const dependencies = steps[ step.stepName ].dependencies || [];
		const dependenciesFound = pick( SignupDependencyStore.get(), dependencies );

		if ( this._canProcessStep( step ) ) {
			this._processingSteps[ step.stepName ] = true;

			SignupActions.processSignupStep( step );

			const apiFunction = steps[ step.stepName ].apiRequestFunction.bind( this );

			apiFunction( ( errors, providedDependencies ) => {
				this._processingSteps[ step.stepName ] = false;
				SignupActions.processedSignupStep( step, errors, providedDependencies );
			}, dependenciesFound, step );
		}
	},

	_destination: function( dependencies ) {
		if ( typeof this._flow.destination === 'function' ) {
			return this._flow.destination( dependencies );
		}

		return this._flow.destination;
	},

	reset: function() {
		SignupProgressStore.off( 'change', this._boundProcess );

		SignupProgressStore.reset();
		SignupDependencyStore.reset();
	}
} );

module.exports = SignupFlowController;
