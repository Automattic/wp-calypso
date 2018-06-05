/**
 * External dependencies
 *
 * @format
 */

import { keys, difference, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import FluxDispatcher from 'dispatcher';
import steps from 'signup/config/steps';
import { updateDependencyStore } from './actions';

/**
 * Compatibility layer, has side effects.
 * Ported over from the deprecated `client/lib/signup/dependency-store`.
 * @returns {Function} a thunk that binds to the flux dispatcher
 */
export function bindToFlux() {
	return dispatch => {
		FluxDispatcher.register( function( payload ) {
			const { action } = payload;
			switch ( action.type ) {
				// From client/lib/signup/actions.js
				case 'PROCESSED_SIGNUP_STEP':
				case 'PROVIDE_SIGNUP_DEPENDENCIES':
				case 'SUBMIT_SIGNUP_STEP':
					if (
						action.type === 'PROVIDE_SIGNUP_DEPENDENCIES' ||
						assertValidDependencies( action )
					) {
						// any dependency from `PROVIDE_SIGNUP_DEPENDENCIES` is valid as it is not associated with a step
						dispatch( updateDependencyStore( action.providedDependencies ) );
					}
					break;
			}
		} );
	};
}

// Used in conjunction with bindToFlux
function assertValidDependencies( action ) {
	const providesDependencies = steps[ action.data.stepName ].providesDependencies || [],
		extraDependencies = difference( keys( action.providedDependencies ), providesDependencies );

	if ( ! isEmpty( extraDependencies ) ) {
		throw new Error(
			`This step (${
				action.data.stepName
			}) provides an unspecified dependency [${ extraDependencies.join(
				', '
			) }]. Make sure to specify it in /signup/config/steps.js, using the providesDependencies property.`
		);
	}

	return isEmpty( extraDependencies );
}
