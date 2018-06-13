/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';
import steps from 'signup/config/steps';
import {
	SIGNUP_PROGRESS_ADD_OR_UPDATE,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
} from 'state/action-types';

export function addOrUpdateStep( step ) {
	return {
		type: SIGNUP_PROGRESS_ADD_OR_UPDATE,
		step,
	};
}

export function completeStep( step ) {
	return addOrUpdateStep( { ...step, status: 'completed' } );
}

export function processStep( step ) {
	return addOrUpdateStep( { ...step, status: 'processing' } );
}

export function setStepInvalid( step, errors ) {
	return addOrUpdateStep( {
		...step,
		errors,
	} );
}

export function submitStep( step ) {
	const stepHasApiRequestFunction = get( steps, `${ step.stepName }.apiRequestFunction` );
	const status = stepHasApiRequestFunction ? 'pending' : 'completed';

	return addOrUpdateStep( { ...step, status } );
}

export function removeUnneededSteps( flowName ) {
	const flowSteps = flows.getFlow( flowName ).steps;
	return {
		type: SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
		validStepNames: flowSteps,
	};
}
