/**
 * External dependencies
 */
import { createReducer } from 'state/utils';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CREATE,
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CLEAR,
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_START,
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_END,
} from 'woocommerce/state/action-types';

export default createReducer( null, {
	[ WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CREATE ]: handleApiPlanCreate,
	[ WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CLEAR ]: handleApiPlanClear,
	[ WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_START ]: handleApiPlanStepStart,
	[ WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_END ]: handleApiPlanStepEnd,
	// TODO: Handle edit actions (e.g. [ WOOCOMMERCE_EDIT_PRODUCT ]: handleEditProduct, )
} );

/* TODO: Handle edit actions (for category too)
function handleEditProduct( apiPlan, action ) {
	const { product, data } = action.payload;
	const newId = data.id;

	if ( newId ) {
		// check if product.id is a placeholder for anything we've got in our plan.
		// Update our placeholders for newId
	}

	return apiPlan;
}
*/

function handleApiPlanCreate( apiPlan, action ) {
	return action.payload;
}

function handleApiPlanClear() {
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
	const { stepIndex, result, time } = action.payload;
	const step = apiPlan[ stepIndex ];

	const newPlan = [ ...apiPlan ];
	newPlan[ stepIndex ] = { ...step, endTime: time, result };

	return newPlan;
}

