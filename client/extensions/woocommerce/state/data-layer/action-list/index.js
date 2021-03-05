/**
 * External dependencies
 */

import debugFactor from 'debug';

const debug = debugFactor( 'woocommerce:action-list' );

/**
 * Internal dependencies
 */
import { actionListStepNext, actionListAnnotate } from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_ACTION_LIST_STEP_NEXT,
	WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS,
	WOOCOMMERCE_ACTION_LIST_STEP_FAILURE,
} from 'woocommerce/state/action-types';

export default {
	[ WOOCOMMERCE_ACTION_LIST_STEP_NEXT ]: [ handleStepNext ],
	[ WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS ]: [ handleStepSuccess ],
	[ WOOCOMMERCE_ACTION_LIST_STEP_FAILURE ]: [ handleStepFailure ],
};

export function handleStepNext( { dispatch }, action, now = Date.now() ) {
	const { actionList } = action;
	const { prevSteps, currentStep, nextSteps } = actionList;
	const [ nextStep, ...remainingSteps ] = nextSteps || [];

	if ( currentStep ) {
		debug( '[handleStepNext] Warning: Attempting before current step finishes. Ignoring.' );
		return;
	}
	if ( ! nextStep ) {
		debug( '[handleStepNext] Warning: Attempting with no nextSteps left. Ignoring.' );
		return;
	}

	const nextActionList = {
		...actionList,
		prevSteps,
		currentStep: { ...nextStep, startTime: now },
		nextSteps: remainingSteps,
	};

	dispatch( actionListAnnotate( nextActionList ) );
	nextStep.onStep( dispatch, nextActionList );
}

export function handleStepSuccess( { dispatch }, action, now = Date.now() ) {
	const { actionList } = action;
	const { prevSteps, currentStep, nextSteps } = actionList;

	if ( ! currentStep ) {
		debug( '[handleStepSuccess] Warning: Attempting with no current step. Ignoring.' );
		return;
	}

	const nextActionList = {
		...actionList,
		prevSteps: [ ...( prevSteps || [] ), { ...currentStep, endTime: now } ],
		currentStep: null,
		nextSteps,
	};

	dispatch( actionListAnnotate( nextActionList ) );

	if ( nextSteps && nextSteps.length > 0 ) {
		dispatch( actionListStepNext( nextActionList ) );
	} else if ( actionList.onSuccess ) {
		actionList.onSuccess( dispatch, nextActionList );
	}
}

export function handleStepFailure( { dispatch }, action, now = Date.now() ) {
	const { actionList, error } = action;
	const { prevSteps, currentStep, nextSteps } = actionList;

	if ( ! currentStep ) {
		debug( '[handleStepFailure] Warning: Attempting with no current step. Ignoring.' );
		return;
	}

	const nextActionList = {
		...actionList,
		prevSteps: [ ...( prevSteps || [] ), { ...currentStep, endTime: now, error } ],
		currentStep: null,
		nextSteps,
	};

	dispatch( actionListAnnotate( nextActionList ) );

	if ( actionList.onFailure ) {
		actionList.onFailure( dispatch, nextActionList );
	}
}
