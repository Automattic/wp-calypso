/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_APIPLAN_CREATE,
	WOOCOMMERCE_APIPLAN_CLEAR,
	WOOCOMMERCE_APIPLAN_STEP_START,
	WOOCOMMERCE_APIPLAN_STEP_END,
} from '../action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_APIPLAN_CREATE ]: handleApiPlanCreate,
	[ WOOCOMMERCE_APIPLAN_CLEAR ]: handleApiPlanClear,
	[ WOOCOMMERCE_APIPLAN_STEP_START ]: handleApiPlanStepStart,
	[ WOOCOMMERCE_APIPLAN_STEP_END ]: handleApiPlanStepEnd,
} );

function handleApiPlanCreate( apiPlan, action ) {
	// The api plan given in the action is our new plan.
	return action.payload;
}

function handleApiPlanClear() {
	// Clear out the existing plan.
	return null;
}

function handleApiPlanStepStart( apiPlan, action ) {
	const { stepIndex, time } = action.payload;
	const step = apiPlan[ stepIndex ];

	const newPlan = [ ...apiPlan ];
	newPlan[ stepIndex ] = { ...step, startTime: time };

	return newPlan;
}

function handleApiPlanStepEnd( apiPlan, action ) {
	const { stepIndex, error, time } = action.payload;
	const step = apiPlan[ stepIndex ];

	const newStep = { ...step, endTime: time };
	if ( error ) {
		newStep.error = error;
	}

	const newPlan = [ ...apiPlan ];
	newPlan[ stepIndex ] = newStep;

	return newPlan;
}

