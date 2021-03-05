/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Get the current step in the action list.
 *
 * @param {object} rootState The root Calypso state.
 * @returns {Array|null} The action list, or null if no action list is present.
 */
export function getActionList( rootState ) {
	const woocommerce = rootState.extensions.woocommerce;
	return get( woocommerce, 'actionList', null );
}

/**
 * Get the number of the current step.
 *
 * This selector returns the 1-indexed number of the step that is currently executing in the action list.
 *
 * @param {object} actionList The action list to check.
 * @returns {number|null} The index of the current step, or actionList.length if all steps are complete,
 */
export function getCurrentStepIndex( actionList ) {
	const { prevSteps, currentStep } = actionList;

	return ( prevSteps ? prevSteps.length : 0 ) + ( currentStep ? 1 : 0 );
}

/**
 * Gets the number of steps in total in the action list.
 *
 * @param {object} actionList The action list to check.
 * @returns {number} The count of steps in total.
 */
export function getTotalStepCount( actionList ) {
	const { prevSteps, currentStep, nextSteps } = actionList;

	return (
		( prevSteps ? prevSteps.length : 0 ) +
		( currentStep ? 1 : 0 ) +
		( nextSteps ? nextSteps.length : 0 )
	);
}

/**
 * Gets the number of steps in the action list that have not been completed.
 *
 * @param {object} actionList The action list to check.
 * @returns {number} The number of steps remaining.
 */
export function getStepCountRemaining( actionList ) {
	const { currentStep, nextSteps } = actionList;

	return ( currentStep ? 1 : 0 ) + ( nextSteps ? nextSteps.length : 0 );
}
