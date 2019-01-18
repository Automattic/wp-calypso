/** @format */

/**
 * Internal dependencies
 */
import {
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
} from 'state/action-types';
import { abtest } from 'lib/abtest';

export function saveStep( step ) {
	return {
		type: SIGNUP_PROGRESS_SAVE_STEP,
		step,
	};
}

export function submitStep( step ) {
	return {
		type: SIGNUP_PROGRESS_SUBMIT_STEP,
		step,
	};
}

export function completeStep( step ) {
	return {
		type: SIGNUP_PROGRESS_COMPLETE_STEP,
		step,
	};
}

export function processStep( step ) {
	return {
		type: SIGNUP_PROGRESS_PROCESS_STEP,
		step,
	};
}

export function invalidateStep( step, errors ) {
	return {
		type: SIGNUP_PROGRESS_INVALIDATE_STEP,
		step,
		errors,
	};
}

export function removeUnneededSteps( flowName ) {
	const inImprovedOnboardingTest = 'onboarding' === abtest( 'improvedOnboarding' );
	return {
		type: SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
		flowName,
		inImprovedOnboardingTest,
	};
}
