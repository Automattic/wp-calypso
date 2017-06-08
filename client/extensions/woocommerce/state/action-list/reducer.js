/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_ACTION_LIST_CREATE,
	WOOCOMMERCE_ACTION_LIST_CLEAR,
	WOOCOMMERCE_ACTION_LIST_STEP_START,
	WOOCOMMERCE_ACTION_LIST_STEP_END,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_ACTION_LIST_CREATE ]: handleActionListCreate,
	[ WOOCOMMERCE_ACTION_LIST_CLEAR ]: handleActionListClear,
	[ WOOCOMMERCE_ACTION_LIST_STEP_START ]: handleActionListStepStart,
	[ WOOCOMMERCE_ACTION_LIST_STEP_END ]: handleActionListStepEnd,
} );

function handleActionListCreate( actionList, action ) {
	// The action list given in the action is our new list.
	// TODO: validate action list?
	return action.actionList;
}

function handleActionListClear() {
	// Clear out the existing action list.
	return null;
}

function handleActionListStepStart( actionList, action ) {
	const { stepIndex, time } = action;
	const step = actionList[ stepIndex ];

	const newActionList = [ ...actionList ];
	newActionList[ stepIndex ] = { ...step, startTime: time };

	return newActionList;
}

function handleActionListStepEnd( actionList, action ) {
	const { stepIndex, error, time } = action;
	const step = actionList[ stepIndex ];

	const newStep = { ...step, endTime: time };
	if ( error ) {
		newStep.error = error;
	}

	const newActionList = [ ...actionList ];
	newActionList[ stepIndex ] = newStep;

	return newActionList;
}

