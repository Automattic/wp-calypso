/**
 * External dependencies
 */
var keys = require( 'lodash/keys' ),
	difference = require( 'lodash/difference' ),
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	steps = require( 'signup/config/steps' );

var SignupDependencyStore = {
	get: function() {
		return SignupDependencyStore.reduxStore.getState().signup.dependencyStore.storeState || {};
	},
	reset: function() {
		SignupDependencyStore.reduxStore.dispatch( {
			type: 'SIGNUP_DEPENDENCY_STORE_RESET',
			data: {}
		} );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	}
};

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

/**
 * Compatibility layer
 */
SignupDependencyStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;

	if ( SignupDependencyStore.reduxStore ) {
		switch ( action.type ) {
			case 'PROCESSED_SIGNUP_STEP':
			case 'SUBMIT_SIGNUP_STEP':
				if ( assertValidDependencies( action ) ) {
					SignupDependencyStore.reduxStore.dispatch( {
						type: 'SIGNUP_DEPENDENCY_STORE_UPDATE_STATE',
						data: action.providedDependencies
					} );
				}
				break;
		}
	} else {
		/**
		 * Catch calls to the SignupDependencyStore where the redux store is not yet initialized.
		 * This should be active only during development and removed later.
		 */
		throw new Error( 'No redux store instance found for the current SignupDependencyStore call!' );
	}
} );

module.exports = SignupDependencyStore;
