/** @format */

/**
 * External dependencies
 */

import { find, isEmpty, map, omit } from 'lodash';

/**
 * Internal dependencies
 */
import steps from 'signup/config/steps';
import {
	SIGNUP_HAS_ERROR,
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROCESS_STEP,
	SIGNUP_PROCESSED_STEP,
	SIGNUP_PROGRESS_UPDATE,
	SIGNUP_SAVE_STEP,
	SIGNUP_SUBMIT_STEP,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { getSignupProgress } from './selectors';
import { schema } from './schema';

//
// Action handlers
//
function saveStep( state, { data: step } ) {
	return addOrUpdateStep( state, step );
}

function submitStep( state, { data: step } ) {
	const stepHasApiRequestFunction =
		steps[ step.stepName ] && steps[ step.stepName ].apiRequestFunction;
	const status = stepHasApiRequestFunction ? 'pending' : 'completed';

	return addOrUpdateStep( { ...step, status } );
}

function processStep( state, { data: step } ) {
	return updateStep( state, { ...step, status: 'processing' } );
}

function completeStep( state, { data: step } ) {
	return updateStep( state, { ...step, status: 'completed' } );
}

//
// Helper functions
//
function addOrUpdateStep( state, step ) {
	if ( find( getSignupProgress( state ), { stepName: step.stepName } ) ) {
		return updateStep( state, step );
	}
	return [ ...state, step ];
}

function updateStep( state, newStep ) {
	return map( getSignupProgress( state ), function( step ) {
		if ( step.stepName === newStep.stepName ) {
			const { status } = newStep;
			if ( status === 'pending' || status === 'completed' ) {
				// Steps that are resubmitted may decide to omit the
				// `processingMessage` or `wasSkipped` status of a step if e.g.
				// the user goes back and chooses to not skip a step. If a step
				// is submitted without these, we explicitly remove them from
				// the step data.
				return { ...omit( step, [ 'processingMessage', 'wasSkipped' ] ), ...newStep };
			}

			return { ...step, ...newStep };
		}

		return step;
	} );
}

function handleErrors( state, { step } ) {
	if ( isEmpty( step.errors ) ) {
		throw new Error( 'SIGNUP_HAS_ERROR was called for a step without any errors' );
	}
	return addOrUpdateStep( state, step );
}

function overwriteSteps( state, action ) {
	return Array.isArray( action.steps ) ? action.steps : [];
}

export default createReducer(
	[],
	{
		[ SIGNUP_HAS_ERROR ]: handleErrors,
		[ SIGNUP_PROCESS_STEP ]: processStep,
		[ SIGNUP_PROCESSED_STEP ]: completeStep,
		[ SIGNUP_SAVE_STEP ]: saveStep,
		[ SIGNUP_SUBMIT_STEP ]: submitStep,
		[ SIGNUP_PROGRESS_UPDATE ]: overwriteSteps,
		[ SIGNUP_COMPLETE_RESET ]: () => [],
	},
	schema
);
