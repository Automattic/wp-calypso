/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Get the current step in the action list.
 *
 * @param {Object} rootState The root Calypso state.
 * @return {Array|null} The action list, or null if no action list is present.
 */
export function getActionList( rootState ) {
	const woocommerce = rootState.extensions.woocommerce;
	return get( woocommerce, 'actionList', null );
}

/**
 * Get the current step in the action list.
 *
 * This selector returns the index of the step that is currently executing in the action list.
 * (The first step in the list that does not have an endTime)
 *
 * @param {Object} actionList The action list to check.
 * @return {Number|null} The index of the current step, or actionList.length if all steps are complete,
 */
export function getCurrentStepIndex( actionList ) {
	for ( let i = 0; i < actionList.length; i++ ) {
		const step = actionList[ i ];
		if ( ! step.endTime ) {
			return i;
		}
	}

	// All steps complete
	return actionList.length;
}

/**
 * Gets the number of steps in the action list that have not been completed.
 *
 * @param {Object} actionList The action list to check.
 * @return {Number} The number of steps remaining.
 */
export function getStepCountRemaining( actionList ) {
	const currentIndex = getCurrentStepIndex( actionList );
	return actionList.length - currentIndex;
}

