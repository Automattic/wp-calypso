
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CREATE,
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CLEAR,
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_START,
	WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_END,
} from 'woocommerce/state/action-types';

/* TODO: Create the plan based on our current edits.
export function createApiPlanForEdits( productCategoryEdit, productEdits, variationEdits ) {
	const plan = [];

	// TODO: sequentially go through edit state and create steps.
	...categories.creates
	...categories.updates
	...categories.deletes

	...product.creates
	...product.updates
	...product.deletes

	...variation.creates
	...variation.updates
	...variation.deletes

	return createApiPlan( plan );
}
*/

/* TODO: Figure out the next step and start it.
export function continueApiPlan( plan ) {
	//const nextStep = getNextStep( plan );

	//...api call for operation

	//return startApiPlanStep( nextStep );
}
*/

/**
 * Action Creator: Clear the current product API plan.
 * @return {Object} action
 */
export function clearApiPlan() {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CLEAR,
	};
}

// The functions below are used internally and for testing.
// TODO: Finalize these action creators.

export function createApiPlan( plan ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_CREATE,
		payload: plan,
	};
}

export function startApiPlanStep( stepIndex, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_START,
		payload: { stepIndex, time }
	};
}

export function endApiPlanStep( stepIndex, result, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_EDIT_PRODUCT_APIPLAN_STEP_END,
		payload: { stepIndex, result, time }
	};
}

