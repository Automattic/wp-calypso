/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_ACTION_LIST_CREATE,
	WOOCOMMERCE_ACTION_LIST_CLEAR,
	WOOCOMMERCE_ACTION_LIST_STEP_START,
	WOOCOMMERCE_ACTION_LIST_STEP_END,
} from '../action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_ACTION_LIST_CREATE ]: handleActionListCreate,
	[ WOOCOMMERCE_ACTION_LIST_CLEAR ]: handleActionListClear,
	[ WOOCOMMERCE_ACTION_LIST_STEP_START ]: handleActionListStepStart,
	[ WOOCOMMERCE_ACTION_LIST_STEP_END ]: handleActionListStepEnd,
} );

function handleActionListCreate( actionList, action ) {
	// The action list given in the action is our new list.
	return action.payload;
}

function handleActionListClear() {
	// Clear out the existing action list.
	return null;
}

function handleActionListStepStart( actionList, action ) {
	const { stepIndex, time } = action.payload;
	const step = actionList[ stepIndex ];

	const newActionList = [ ...actionList ];
	newActionList[ stepIndex ] = { ...step, startTime: time };

	return newActionList;
}

function handleActionListStepEnd( actionList, action ) {
	const { stepIndex, error, time } = action.payload;
	const step = actionList[ stepIndex ];

	const newStep = { ...step, endTime: time };
	if ( error ) {
		newStep.error = error;
	}

	const newActionList = [ ...actionList ];
	newActionList[ stepIndex ] = newStep;

	return newActionList;
}

