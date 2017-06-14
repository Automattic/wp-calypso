/**
 * Internal dependencies
 */
import { getActionList } from 'woocommerce/state/action-list/selectors';
import { actionListStepStart } from 'woocommerce/state/action-list/actions';
import {
	WOOCOMMERCE_ACTION_LIST_STEP_START,
	WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS,
} from 'woocommerce/state/action-types';

export function handleStepStart( { dispatch, getState }, action ) {
	const { stepIndex } = action;

	const actionList = getActionList( getState() );
	const step = actionList[ stepIndex ];
	dispatch( step.action );
}

export function handleStepSuccess( { dispatch, getState }, action ) {
	const { stepIndex, time } = action;

	// TODO: Consider a bit of sanity checking to ensure the next index is the right one?

	const actionList = getActionList( getState() );
	const nextStepIndex = stepIndex + 1;

	if ( nextStepIndex < actionList.length ) {
		// Still more work to do.
		dispatch( actionListStepStart( nextStepIndex, time ) );
	}
}

export default {
	[ WOOCOMMERCE_ACTION_LIST_STEP_START ]: [ handleStepStart ],
	[ WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS ]: [ handleStepSuccess ],
};

