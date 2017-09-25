
/**
 * Internal dependencies
 */
import { WOOCOMMERCE_ACTION_LIST_ANNOTATE, WOOCOMMERCE_ACTION_LIST_CLEAR, WOOCOMMERCE_ACTION_LIST_STEP_NEXT, WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS, WOOCOMMERCE_ACTION_LIST_STEP_FAILURE } from '../action-types';

/**
 * Action Creator: Start next action list step.
 *
 * @param {Object} actionList The current action list.
 * @return {Object} action
 */
export function actionListStepNext( actionList ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_NEXT,
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
 * Action Creator: Annotate the current representation of the action list to state.
 * @param {Object} actionList The current actionList
 * @return {Object} action
 */
export function actionListAnnotate( actionList ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_ANNOTATE,
		actionList,
	};
}

/**
 * Action Creator: Mark current step as successful.
 *
 * @param {Object} actionList The current action list.
 * @return {Object} action
 */
export function actionListStepSuccess( actionList ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_SUCCESS,
		actionList,
	};
}

/**
 * Action Creator: Mark current step as failed.
 *
 * @param {Object} actionList The current action list.
 * @param {Object} error The error from the failure.
 * @return {Object} action
 */
export function actionListStepFailure( actionList, error ) {
	return {
		type: WOOCOMMERCE_ACTION_LIST_STEP_FAILURE,
		actionList,
		error,
	};
}

