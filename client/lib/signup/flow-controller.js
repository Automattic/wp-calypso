/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:signup:flow-controller' ), // eslint-disable-line no-unused-vars
	store = require( 'store' ),
	Dispatcher = require( 'dispatcher' ),
	assign = require( 'lodash/object/assign' ),
	defer = require( 'lodash/function/defer' ),
	difference = require( 'lodash/array/difference' ),
	every = require( 'lodash/collection/every' ),
	isEmpty = require( 'lodash/lang/isEmpty' ),
	compact = require( 'lodash/array/compact' ),
	flatten = require( 'lodash/array/flatten' ),
	map = require( 'lodash/collection/map' ),
	reject = require( 'lodash/collection/reject' ),
	where = require( 'lodash/collection/where' ),
	find = require( 'lodash/collection/find' ),
	pick = require( 'lodash/object/pick' ),
	keys = require( 'lodash/object/keys' );

/**
 * Internal dependencies
 */
var SignupActions = require( './actions' ),
	SignupProgressStore = require( './progress-store' ),
	SignupDependencyStore = require( './dependency-store' ),
	flows = require( 'signup/config/flows' ),
	steps = require( 'signup/config/steps' ),
	oauthToken = require( 'lib/oauth-token' ),
	user = require( 'lib/user' )();

import { actions as ActionTypes } from 'lib/oauth-store/constants';

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

			dependenciesNotProvided = difference( step.dependencies, this._getFlowProvidesDependencies() );
			if ( ! isEmpty( dependenciesNotProvided ) ) {
				throw new Error( 'The ' + step.stepName + ' step requires dependencies [' + dependenciesNotProvided + '] which ' +
				'are not provided in the ' + this._flowName + ' flow.' );
			}
			return true;
		}, this );
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
		}, this );
	},

	_canMakeAuthenticatedRequests: function() {
		return oauthToken.getToken() || user.get();
	},

	_getFlowProvidesDependencies: function() {
		return flatten( compact( map( this._flow.steps, function( step ) {
			return steps[ step ].providesDependencies;
		} ) ) );
	},

	_process: function() {
		var signupProgress = SignupProgressStore.get(),
			pendingSteps = where( signupProgress, { status: 'pending' } ),
			completedSteps = where( signupProgress, { status: 'completed' } ),
			bearerToken = SignupDependencyStore.get().bearer_token,
			dependencies = SignupDependencyStore.get();

		if ( bearerToken && ! oauthToken.getToken() ) {
			Dispatcher.handleServerAction( {
				type: ActionTypes.RECEIVE_AUTH_LOGIN,
				data: {
					body: {
						access_token: bearerToken
					}
				}
			} );
			// oauthToken.setToken( bearerToken );
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

			steps[ step.stepName ].apiRequestFunction( function( errors, providedDependencies ) {
				this._processingSteps[ step.stepName ] = false;
				SignupActions.processedSignupStep( step, errors, providedDependencies );
			}.bind( this ), dependenciesFound, step );
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
