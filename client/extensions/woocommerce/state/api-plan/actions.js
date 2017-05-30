
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_APIPLAN_CREATE,
	WOOCOMMERCE_APIPLAN_CLEAR,
	WOOCOMMERCE_APIPLAN_STEP_START,
	WOOCOMMERCE_APIPLAN_STEP_END,
} from '../action-types';

/**
 * Action Creator: Create new API plan.
 *
 * @param {Object} plan The sequential plan for API requests.
 * @return {Object} action
 */
export function apiPlanCreate( plan ) {
	return {
		type: WOOCOMMERCE_APIPLAN_CREATE,
		payload: plan,
	};
}

/**
 * Action Creator: Clear the current product API plan.
 * @return {Object} action
 */
export function apiPlanClear() {
	return {
		type: WOOCOMMERCE_APIPLAN_CLEAR,
	};
}

/**
 * Action Creator: Mark step as started.
 *
 * @param {Number} stepIndex The index of the step.
 * @param {Date} [time=Date.now()] Optional timestamp.
 * @return {Object} action
 */
export function apiPlanStepStarted( stepIndex, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_APIPLAN_STEP_START,
		payload: { stepIndex, time }
	};
}

/**
 * Action Creator: Mark step as ended.
 *
 * @param {Number} stepIndex The index of the step.
 * @param {Object|undefined} error Optional error message, if not present, success assumed.
 * @param {Date} [time=Date.now()] Optional timestamp.
 * @return {Object} action
 */
export function apiPlanStepEnded( stepIndex, error, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_APIPLAN_STEP_END,
		payload: { stepIndex, error, time }
	};
}

