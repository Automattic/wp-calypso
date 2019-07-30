/** @format */

/**
 * External dependencies
 */
import { has, keyBy, get } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import stepsConfig from 'signup/config/steps-pure';
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_RESUME_AFTER_LOGIN_SET,
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
} from 'state/action-types';
import { createReducer } from 'state/utils';
import { schema } from './schema';

const debug = debugFactory( 'calypso:state:signup:progress:reducer' );

//
// Helper Functions
//
const addStep = ( state, step ) => {
	debug( `Adding step ${ step.stepName }` );

	return {
		...state,
		[ step.stepName ]: step,
	};
};

const updateStep = ( state, newStepState ) => {
	const { stepName, status } = newStepState;
	const stepState = get( state, stepName );

	debug( `Updating step ${ stepName }` );

	if ( status === 'pending' || status === 'completed' ) {
		// This can only happen when submitting a step
		//
		// Steps that are resubmitted may decide to omit the `wasSkipped` status of a step if e.g.
		// the user goes back and chooses to not skip a step. If a step is submitted without it,
		// we explicitly remove it from the step data.
		const { wasSkipped, ...commonStepArgs } = stepState;

		return {
			...state,
			[ stepName ]: {
				...commonStepArgs,
				...newStepState,
			},
		};
	}

	return {
		...state,
		[ stepName ]: {
			...stepState,
			...newStepState,
		},
	};
};

//
// Action handlers
//

// When called without action.steps, this is basically a state reset function.
const overwriteSteps = ( state, { steps = {} } ) => keyBy( steps, 'stepName' );

const completeStep = ( state, { step } ) => updateStep( state, { ...step, status: 'completed' } );

const invalidateStep = ( state, { step, errors } ) => {
	const newStepState = { ...step, errors, status: 'invalid' };

	return has( state, step.stepName )
		? updateStep( state, newStepState )
		: addStep( state, newStepState );
};

const processStep = ( state, { step } ) => updateStep( state, { ...step, status: 'processing' } );

const saveStep = ( state, { step } ) =>
	has( state, step.stepName )
		? updateStep( state, step )
		: addStep( state, { ...step, status: 'in-progress' } );

function setResumeAfterLogin( state, { resumeStep } ) {
	debug( `Setting resume after login for step ${ resumeStep.stepName }` );
	return updateStep( state, { ...resumeStep, status: 'in-progress' } );
}

const submitStep = ( state, { step } ) => {
	const stepHasApiRequestFunction = get( stepsConfig, [ step.stepName, 'apiRequestFunction' ] );
	const status = stepHasApiRequestFunction ? 'pending' : 'completed';

	return has( state, step.stepName )
		? updateStep( state, { ...step, status } )
		: addStep( state, { ...step, status } );
};

export default createReducer(
	{},
	{
		[ SIGNUP_COMPLETE_RESET ]: overwriteSteps,
		[ SIGNUP_PROGRESS_COMPLETE_STEP ]: completeStep,
		[ SIGNUP_PROGRESS_INVALIDATE_STEP ]: invalidateStep,
		[ SIGNUP_PROGRESS_PROCESS_STEP ]: processStep,
		[ SIGNUP_PROGRESS_RESUME_AFTER_LOGIN_SET ]: setResumeAfterLogin,
		[ SIGNUP_PROGRESS_SAVE_STEP ]: saveStep,
		[ SIGNUP_PROGRESS_SUBMIT_STEP ]: submitStep,
	},
	schema
);
