
/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_ACTION_LIST_ANNOTATE,
	WOOCOMMERCE_ACTION_LIST_CREATE,
	WOOCOMMERCE_ACTION_LIST_CLEAR,
	WOOCOMMERCE_ACTION_LIST_STEP_NEXT,
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
 * Action Creator: Annotate a step in the action list.
 * @param {Number} stepIndex The index of the step to annotate.
 * @param {Object} annotations One or more of startTime, endTime, or error
 * @return {Object} action
 */
export function actionListStepAnnotate( stepIndex, annotations ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_ANNOTATE,
		stepIndex,
		annotations
	};
}

/**
 * Action Creator: Start next action list step.
 *
 * @param {Date} [time] Optional timestamp.
 * @return {Object} action
 */
export function actionListStepNext( time ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_NEXT,
		time,
	};
}

/**
 * Action Creator: Mark step as successful.
 *
 * @param {Number} stepIndex The index of the step.
 * @param {Date} [time] Optional timestamp.
 * @return {Object} action
 */
export function actionListStepSuccess( stepIndex, time ) {
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
 * @param {Date} [time] Optional timestamp.
 * @return {Object} action
 */
export function actionListStepFailure( stepIndex, error, time ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_FAILURE,
		stepIndex,
		error,
		time,
	};
}

