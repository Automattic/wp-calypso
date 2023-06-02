import debugFactory from 'debug';
import { keyBy, get, omit } from 'lodash';
import stepsConfig from 'calypso/signup/config/steps-pure';
import {
	SIGNUP_COMPLETE_RESET,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_REMOVE_STEP,
	SIGNUP_PROGRESS_ADD_STEP,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
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

	if ( ! stepState ) {
		return state;
	}

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

const removeStep = ( state, { step } ) => {
	const newState = omit( state, step.stepName );

	return newState;
};

const completeStep = ( state, { step } ) => updateStep( state, { ...step, status: 'completed' } );

const invalidateStep = ( state, { step, errors } ) => {
	const newStepState = { ...step, errors, status: 'invalid' };

	return state.hasOwnProperty( step.stepName )
		? updateStep( state, newStepState )
		: addStep( state, newStepState );
};

const processStep = ( state, { step } ) => updateStep( state, { ...step, status: 'processing' } );

const saveStep = ( state, { step } ) => {
	const status = get( state, [ step.stepName, 'status' ] );

	return state.hasOwnProperty( step.stepName )
		? updateStep( state, {
				...step,
				// The pending status means this step needs to delay api requests until the setup-site flow completes
				// In case the user goes back to an earlier step and changes their intent
				// So we can mark status as in-progress
				status:
					status === 'pending' && step.lastKnownFlow === 'setup-site' ? 'in-progress' : status,
		  } )
		: addStep( state, { ...step, status: 'in-progress' } );
};

const submitStep = ( state, { step } ) => {
	const stepHasApiRequestFunction = get( stepsConfig, [ step.stepName, 'apiRequestFunction' ] );
	const status = stepHasApiRequestFunction ? 'pending' : 'completed';

	return state.hasOwnProperty( step.stepName )
		? updateStep( state, { ...step, status } )
		: addStep( state, { ...step, status } );
};

export default withSchemaValidation( schema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SIGNUP_PROGRESS_ADD_STEP:
			return addStep( state, action.step );
		case SIGNUP_COMPLETE_RESET:
			return overwriteSteps( state, action );
		case SIGNUP_PROGRESS_COMPLETE_STEP:
			return completeStep( state, action );
		case SIGNUP_PROGRESS_INVALIDATE_STEP:
			return invalidateStep( state, action );
		case SIGNUP_PROGRESS_PROCESS_STEP:
			return processStep( state, action );
		case SIGNUP_PROGRESS_SAVE_STEP:
			return saveStep( state, action );
		case SIGNUP_PROGRESS_SUBMIT_STEP:
			return submitStep( state, action );
		case SIGNUP_PROGRESS_REMOVE_STEP:
			return removeStep( state, action );
	}

	return state;
} );
