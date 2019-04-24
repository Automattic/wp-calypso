/** @format */

/**
 * External dependencies
 */
import { get, find, map } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import stepsConfig from 'signup/config/steps-pure';
import flows from 'signup/config/flows-pure';
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { schema } from './schema';
import userFactory from 'lib/user';

const debug = debugFactory( 'calypso:state:signup:progress:reducer' );

//
// Action handlers
//
function overwriteSteps( state, { steps = [] } ) {
	// When called without action.steps, this is basically a state reset function.
	return Array.isArray( steps ) ? steps : [];
}

function completeStep( state, { step } ) {
	return updateStep( state, { ...step, status: 'completed' } );
}

function invalidateStep( state, { step, errors } ) {
	const newStep = { ...step, errors, status: 'invalid' };
	if ( find( state, { stepName: newStep.stepName } ) ) {
		return updateStep( state, newStep );
	}
	return addStep( state, newStep );
}

function processStep( state, { step } ) {
	return updateStep( state, { ...step, status: 'processing' } );
}

function removeUnneededSteps( state, { flowName } ) {
	let flowSteps = [];
	const user = userFactory();

	flowSteps = get( flows, [ flowName, 'steps' ], [] );

	if ( user && user.get() ) {
		flowSteps = flowSteps.filter( item => item !== 'user' );
	}

	return state.filter(
		( step, index ) =>
			flowSteps.includes( step.stepName ) && index === flowSteps.indexOf( step.stepName )
	);
}

function saveStep( state, { step } ) {
	if ( find( state, { stepName: step.stepName } ) ) {
		return updateStep( state, step );
	}

	return addStep( state, { ...step, status: 'in-progress' } );
}

function submitStep( state, { step } ) {
	const stepHasApiRequestFunction = get( stepsConfig, [ step.stepName, 'apiRequestFunction' ] );
	const status = stepHasApiRequestFunction ? 'pending' : 'completed';

	if ( find( state, { stepName: step.stepName } ) ) {
		return updateStep( state, { ...step, status } );
	}

	return addStep( state, { ...step, status } );
}

//
// Helper Functions
//
function addStep( state, step ) {
	debug( `Adding step ${ step.stepName }` );
	return [ ...state, step ];
}

function updateStep( state, newStep ) {
	debug( `Updating step ${ newStep.stepName }` );
	return map( state, function( step ) {
		if ( step.stepName === newStep.stepName ) {
			const { status } = newStep;
			if ( status === 'pending' || status === 'completed' ) {
				// This can only happen when submitting a step
				//
				// Steps that are resubmitted may decide to omit the `wasSkipped` status of a step if e.g.
				// the user goes back and chooses to not skip a step. If a step is submitted without it,
				// we explicitly remove it from the step data.
				const { wasSkipped, ...commonStepArgs } = step;
				return { ...commonStepArgs, ...newStep };
			}

			return { ...step, ...newStep };
		}

		return step;
	} );
}

//
// Reducer export
//
export default createReducer(
	[],
	{
		[ SIGNUP_COMPLETE_RESET ]: overwriteSteps,
		[ SIGNUP_PROGRESS_COMPLETE_STEP ]: completeStep,
		[ SIGNUP_PROGRESS_INVALIDATE_STEP ]: invalidateStep,
		[ SIGNUP_PROGRESS_PROCESS_STEP ]: processStep,
		[ SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS ]: removeUnneededSteps,
		[ SIGNUP_PROGRESS_SAVE_STEP ]: saveStep,
		[ SIGNUP_PROGRESS_SUBMIT_STEP ]: submitStep,
	},
	schema
);
