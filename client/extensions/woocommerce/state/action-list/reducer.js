/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { WOOCOMMERCE_ACTION_LIST_ANNOTATE, WOOCOMMERCE_ACTION_LIST_CLEAR } from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_ACTION_LIST_CLEAR ]: handleActionListClear,
	[ WOOCOMMERCE_ACTION_LIST_ANNOTATE ]: handleActionListAnnotate,
} );

function handleActionListClear() {
	// Clear out the existing action list.
	return null;
}

function handleActionListAnnotate( actionlist, action ) {
	const { prevSteps, currentStep, nextSteps } = action.actionList;
	const pickNames = [ 'description', 'startTime', 'endTime' ];

	return {
		prevSteps: ( prevSteps || [] ).map( ( step ) => pick( step, pickNames ) ),
		currentStep: ( currentStep ? pick( currentStep, pickNames ) : null ),
		nextSteps: nextSteps.map( ( step ) => pick( step, pickNames ) ),
	};
}

