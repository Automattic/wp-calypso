/** @format */

/**
 * External dependencies
 */

import { keys, difference, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_DEPENDENCY_STORE_UPDATE } from 'state/action-types';

import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import Dispatcher from 'dispatcher';
import steps from 'signup/config/steps';

const SignupDependencyStore = {
	get() {
		return getSignupDependencyStore( SignupDependencyStore.reduxStore.getState() );
	},
	update( data ) {
		SignupDependencyStore.reduxStore.dispatch( { type: SIGNUP_DEPENDENCY_STORE_UPDATE, data } );
	},
	reset() {
		SignupDependencyStore.reduxStore.dispatch( { type: SIGNUP_COMPLETE_RESET } );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},
};

function assertValidDependencies( action ) {
	const providesDependencies = steps[ action.data.stepName ].providesDependencies || [],
		extraDependencies = difference( keys( action.providedDependencies ), providesDependencies );

	if ( ! isEmpty( extraDependencies ) ) {
		throw new Error(
			'This step (' +
				action.data.stepName +
				') provides an unspecified dependency [' +
				extraDependencies.join( ', ' ) +
				'].' +
				' Make sure to specify it in /signup/config/steps.js, using the providesDependencies property.'
		);
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
			case 'PROVIDE_SIGNUP_DEPENDENCIES':
			case 'SUBMIT_SIGNUP_STEP':
				if ( action.type === 'PROVIDE_SIGNUP_DEPENDENCIES' || assertValidDependencies( action ) ) {
					// any dependency from `PROVIDE_SIGNUP_DEPENDENCIES` is valid as it is not associated with a step
					SignupDependencyStore.update( action.providedDependencies );
				}
				break;
		}
	}
} );

export default SignupDependencyStore;
