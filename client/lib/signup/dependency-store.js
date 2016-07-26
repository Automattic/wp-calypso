/**
 * External dependencies
 */
import { keys, difference, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SIGNUP_DEPENDENCY_STORE_RESET,
	SIGNUP_DEPENDENCY_STORE_UPDATE,
} from 'state/action-types';

import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';

import Dispatcher from 'dispatcher';
import steps from 'signup/config/steps';

const SignupDependencyStore = {
	get: function() {
		return getSignupDependencyStore( SignupDependencyStore.reduxStore.getState() );
	},
	reset: function() {
		SignupDependencyStore.reduxStore.dispatch( {
			type: SIGNUP_DEPENDENCY_STORE_RESET,
			data: {}
		} );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	}
};

function assertValidDependencies( action ) {
	const providesDependencies = steps[ action.data.stepName ].providesDependencies || [],
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
						type: SIGNUP_DEPENDENCY_STORE_UPDATE,
						data: action.providedDependencies
					} );
				}
				break;
		}
	}
} );

module.exports = SignupDependencyStore;
