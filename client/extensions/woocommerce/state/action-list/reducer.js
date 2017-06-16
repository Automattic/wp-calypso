/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_ACTION_LIST_ANNOTATE,
	WOOCOMMERCE_ACTION_LIST_CREATE,
	WOOCOMMERCE_ACTION_LIST_CLEAR,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_ACTION_LIST_CREATE ]: handleActionListCreate,
	[ WOOCOMMERCE_ACTION_LIST_CLEAR ]: handleActionListClear,
	[ WOOCOMMERCE_ACTION_LIST_ANNOTATE ]: handleActionListAnnotate,
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

function handleActionListAnnotate( actionList, action ) {
	const { stepIndex, annotations } = action;

	if ( undefined !== typeof stepIndex ) {
		const { startTime, endTime, error } = annotations;
		const step = actionList.steps[ stepIndex ];

		const newStep = { ...step };

		if ( startTime ) {
			newStep.startTime = startTime;
		}
		if ( endTime ) {
			newStep.endTime = endTime;
		}
		if ( error ) {
			newStep.error = error;
		}

		const newSteps = { ...actionList.steps };
		newSteps[ stepIndex ] = newStep;
		return { ...actionList, steps: newSteps };
	}

	return actionList;
}

