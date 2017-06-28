/**
 * External dependencies
 */
import debugFactor from 'debug';

const debug = debugFactor( 'woocommerce:action-list' );

/**
 * Internal dependencies
 */
import { getActionList, getCurrentStepIndex } from 'woocommerce/state/action-list/selectors';
import {
	actionListClear,
	actionListStepAnnotate,
	actionListStepNext,
} from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_ACTION_LIST_STEP_NEXT,
	WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS,
	WOOCOMMERCE_ACTION_LIST_STEP_FAILURE,
} from 'woocommerce/state/action-types';

export function handleStepNext( { dispatch, getState }, action ) {
	const startTime = action.time || Date.now();
	const actionList = getActionList( getState() );
	const stepIndex = getCurrentStepIndex( actionList );
	const step = actionList.steps[ stepIndex ];

	if ( step.startTime ) {
		debug( `WOOCOMMERCE_ACTION_LIST_STEP_NEXT dispatched twice for step ${ stepIndex }` );
		return;
	}

	dispatch( actionListStepAnnotate( stepIndex, { startTime } ) );
	dispatch( step.action );
}

export function handleStepSuccess( { dispatch, getState }, action ) {
	const { stepIndex, time } = action;
	const endTime = time || Date.now();
	const actionList = getActionList( getState() );
	const currentStepIndex = getCurrentStepIndex( actionList );
	const nextStepIndex = currentStepIndex + 1;

	dispatch( actionListStepAnnotate( stepIndex, { endTime } ) );

	if ( nextStepIndex < actionList.steps.length ) {
		// Still more work to do.
		dispatch( actionListStepNext( action.time ) );
	} else {
		// All done!
		debug( `Action List Success. ${ actionList.steps.length } steps completed.` );
		if ( actionList.successAction ) {
			dispatch( actionList.successAction );
		}
		if ( actionList.clearUponComplete ) {
			dispatch( actionListClear() );
		}
	}
}

export function handleStepFailure( { dispatch, getState }, action ) {
	const { stepIndex, time, error } = action;
	const actionList = getActionList( getState() );
	const endTime = time || Date.now();

	debug( `Action List Failed on step ${ stepIndex } with error: ${ error }` );

	dispatch( actionListStepAnnotate( stepIndex, { endTime, error } ) );
	if ( actionList.failureAction ) {
		dispatch( actionList.failureAction );
	}
	if ( actionList.clearUponComplete ) {
		dispatch( actionListClear() );
	}
}

export default {
	[ WOOCOMMERCE_ACTION_LIST_STEP_NEXT ]: [ handleStepNext ],
	[ WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS ]: [ handleStepSuccess ],
	[ WOOCOMMERCE_ACTION_LIST_STEP_FAILURE ]: [ handleStepFailure ],
};

