/** @format */

/**
 * External dependencies
 */
import { find, map, omit } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_ADD_OR_UPDATE,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
	SIGNUP_PROGRESS_SET,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { schema } from './schema';

const debug = debugFactory( 'calypso:state:signup:progress:reducer' );

function addOrUpdateStep( state, { step } ) {
	if ( find( state, { stepName: step.stepName } ) ) {
		return updateStep( state, step );
	}

	debug( `Adding step ${ step.stepName }` );
	return [ ...state, step ];
}

function overwriteSteps( state, { steps = [] } ) {
	return Array.isArray( steps ) ? steps : [];
}

function updateStep( state, newStep ) {
	debug( `Updating step ${ newStep.stepName }` );
	return map( state, function( step ) {
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

function removeUnneededSteps( state, { validStepNames } ) {
	return state.filter( step => validStepNames.includes( step.stepName ) );
}

export default createReducer(
	[],
	{
		[ SIGNUP_COMPLETE_RESET ]: overwriteSteps,
		[ SIGNUP_PROGRESS_ADD_OR_UPDATE ]: addOrUpdateStep,
		[ SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS ]: removeUnneededSteps,
		[ SIGNUP_PROGRESS_SET ]: overwriteSteps,
	},
	schema
);
