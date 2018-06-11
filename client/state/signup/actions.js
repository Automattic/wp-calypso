/** @format */

/**
 * External dependencies
 */
import { get, isEmpty, omit } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import steps from 'signup/config/steps';
import {
	SIGNUP_HAS_ERROR,
	SIGNUP_PROCESS_STEP,
	SIGNUP_PROCESSED_STEP,
	SIGNUP_PROVIDE_DEPENDENCIES,
	SIGNUP_SAVE_STEP,
	SIGNUP_SUBMIT_STEP,
	SIGNUP_COMPLETE_RESET,
} from 'state/action-types';

//
// Action functions
//
export function resetSignup() {
	return { type: SIGNUP_COMPLETE_RESET };
}

export function saveSignupStep( step ) {
	return {
		type: SIGNUP_SAVE_STEP,
		step: addTimestamp( step ),
	};
}

export function submitSignupStep( step, errors, providedDependencies ) {
	analytics.tracks.recordEvent( 'calypso_signup_actions_submit_step', {
		step: step.stepName,
		hasError: ! isEmpty( errors ),
	} );

	if ( ! isEmpty( errors ) ) {
		return propagateSignupError( step, errors );
	}

	return {
		type: SIGNUP_SUBMIT_STEP,
		step: addTimestamp( addStorableDependencies( step, providedDependencies ) ),
	};
}

/**
 * Action for providing dependencies not associated with a step.
 *
 * @param {object} providedDependencies - Object containing dependencies
 * @returns {object} action
 */
export function provideDependencies( providedDependencies ) {
	return {
		type: SIGNUP_PROVIDE_DEPENDENCIES,
		providedDependencies,
	};
}

export function processSignupStep( step, errors, providedDependencies ) {
	if ( ! isEmpty( errors ) ) {
		return propagateSignupError( step, errors );
	}

	return {
		type: SIGNUP_PROCESS_STEP,
		step: addTimestamp( addStorableDependencies( step, providedDependencies ) ),
	};
}

export function processedSignupStep( step, errors, providedDependencies ) {
	analytics.tracks.recordEvent( 'calypso_signup_actions_complete_step', {
		step: step.stepName,
		hasError: ! isEmpty( errors ),
	} );

	if ( ! isEmpty( errors ) ) {
		return propagateSignupError( step, errors );
	}

	return {
		type: SIGNUP_PROCESSED_STEP,
		step: addTimestamp( addStorableDependencies( step, providedDependencies ) ),
	};
}

export function propagateSignupError( step, errors ) {
	return {
		type: SIGNUP_HAS_ERROR,
		step: addTimestamp( { ...step, errors, status: 'invalid' } ),
	};
}

//
// Helper functions
//
export function addTimestamp( step ) {
	return { ...step, lastUpdated: Date.now() };
}

export function addStorableDependencies( step, dependencies ) {
	const unstorableDependencies = get( steps, [ step.stepName, 'unstorableDependencies' ] );

	if ( isEmpty( dependencies ) ) {
		return step;
	}

	const providedDependencies = omit( dependencies, unstorableDependencies );

	return { ...step, providedDependencies };
}
