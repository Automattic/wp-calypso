/**
 * External dependencies
 */
var store = require( 'store' ),
	assign = require( 'lodash/assign' ),
	keys = require( 'lodash/keys' ),
	difference = require( 'lodash/difference' ),
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	config = require( 'config' ),
	steps = require( 'signup/config/steps' ),
	emitter = require( 'lib/mixins/emitter' );

/**
 * Constants
 */
const STORAGE_KEY = 'signupDependencies';

/**
 * Module variables
 */
var signupDependencies = {};

var SignupDependencyStore = {
	get: function() {
		return signupDependencies;
	},
	reset: function() {
		signupDependencies = {};
		store.remove( STORAGE_KEY );
	}
};

emitter( SignupDependencyStore );

function addDependencies( dependencies ) {
	signupDependencies = assign( {}, signupDependencies, dependencies );

	handleChange();
}

function assertValidDependencies( action ) {
	var providesDependencies = steps[ action.data.stepName ].providesDependencies || [],
		extraDependencies = difference( keys( action.providedDependencies ), providesDependencies );

	if ( ! isEmpty( extraDependencies ) ) {
		throw new Error( 'This step (' + action.data.stepName + ') provides an unspecified dependency [' +
			extraDependencies.join( ', ' ) + '].' +
			' Make sure to specify it in /signup/config/steps.js, using the providesDependencies property.' );
	}

	return isEmpty( extraDependencies );
}

function loadDependenciesFromCache() {
	const cachedSignupDependencies = store.get( STORAGE_KEY );

	if ( ! isEmpty( cachedSignupDependencies ) ) {
		signupDependencies = cachedSignupDependencies;
	}

	handleChange();
}

function handleChange() {
	SignupDependencyStore.emit( 'change' );
	saveDependencies();
}

function saveDependencies() {
	store.set( STORAGE_KEY, signupDependencies );
}

SignupDependencyStore.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;

	switch ( action.type ) {
		case 'FETCH_CACHED_SIGNUP':
			loadDependenciesFromCache();
			break;
		case 'SAVE_SIGNUP_STEP':
			// If we return to an abandoned signup in a separate tab after the local storage has been completed
			// we can resume signup from local storage, but if we do so we must also preserve the dependency store
			// as well as the progress store
			saveDependencies();
			break;
		case 'SUBMIT_SIGNUP_STEP':
			if ( action.providedDependencies ) {
				if ( assertValidDependencies( action ) ) {
					addDependencies( action.providedDependencies );
				}
			}
			break;
		case 'PROCESSED_SIGNUP_STEP':
			if ( action.providedDependencies ) {
				if ( assertValidDependencies( action ) ) {
					addDependencies( action.providedDependencies );
				}
			}
			break;
	}
} );

module.exports = SignupDependencyStore;
