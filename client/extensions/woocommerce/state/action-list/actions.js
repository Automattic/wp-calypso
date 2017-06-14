
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_ACTION_LIST_CREATE,
	WOOCOMMERCE_ACTION_LIST_CLEAR,
	WOOCOMMERCE_ACTION_LIST_STEP_START,
	WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS,
	WOOCOMMERCE_ACTION_LIST_STEP_FAILURE,
} from '../action-types';

/**
 * Action Creator: Create new Action List.
 *
 * @param {Object} actionList The sequential actionList to be carried out
 * @return {Object} action
 */
export function actionListCreate( actionList ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_CREATE,
		actionList,
	};
}

/**
 * Action Creator: Clear the current Action List.
 * @return {Object} action
 */
export function actionListClear() {
	return {
		type: WOOCOMMERCE_ACTION_LIST_CLEAR,
	};
}

/**
 * Action Creator: Start action list step.
 *
 * @param {Number} [stepIndex] The index of the step. Defaults to zero (0), first index.
 * @param {Date} [time=Date.now()] Optional timestamp.
 * @return {Object} action
 */
export function actionListStepStart( stepIndex = 0, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_START,
		stepIndex,
		time,
	};
}

/**
 * Action Creator: Mark step as successful.
 *
 * @param {Number} stepIndex The index of the step.
 * @param {Date} [time=Date.now()] Optional timestamp.
 * @return {Object} action
 */
export function actionListStepSuccess( stepIndex, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS,
		stepIndex,
		time,
	};
}

/**
 * Action Creator: Mark step as failed.
 *
 * @param {Number} stepIndex The index of the step.
 * @param {Object} error The error from the failure.
 * @param {Date} [time=Date.now()] Optional timestamp.
 * @return {Object} action
 */
export function actionListStepFailure( stepIndex, error, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_FAILURE,
		stepIndex,
		error,
		time,
	};
}

