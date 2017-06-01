
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_ACTION_LIST_CREATE,
	WOOCOMMERCE_ACTION_LIST_CLEAR,
	WOOCOMMERCE_ACTION_LIST_STEP_START,
	WOOCOMMERCE_ACTION_LIST_STEP_END,
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
		payload: actionList,
	};
}

/**
 * Action Creator: Clear the current product Action List.
 * @return {Object} action
 */
export function actionListClear() {
	return {
		type: WOOCOMMERCE_ACTION_LIST_CLEAR,
	};
}

/**
 * Action Creator: Mark step as started.
 *
 * @param {Number} stepIndex The index of the step.
 * @param {Date} [time=Date.now()] Optional timestamp.
 * @return {Object} action
 */
export function actionListStepStarted( stepIndex, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_START,
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
export function actionListStepEnded( stepIndex, error, time = Date.now() ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_END,
		payload: { stepIndex, error, time }
	};
}

