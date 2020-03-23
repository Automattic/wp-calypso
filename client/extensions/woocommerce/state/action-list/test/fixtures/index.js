/**
 * Internal dependencies
 */

import {
	actionListStepSuccess,
	actionListStepFailure,
} from 'woocommerce/state/action-list/actions';

export const time = {
	stepAStart: Date.now() - 3000,
	stepAEnd: Date.now() - 3100,
	stepBStart: Date.now() - 2000,
	stepBEnd: Date.now() - 1100,
	stepCStart: Date.now() - 1000,
	stepCEnd: Date.now() - 500,
	stepEStart: Date.now() - 2500,
	stepEEnd: Date.now() - 2200,
};

export const stepA = {
	description: 'Do Step A',
	onStep: ( dispatch, actionList ) => {
		dispatch( { type: '%% action a %%' } );
		dispatch( actionListStepSuccess( actionList ) );
	},
};
export const stepAStarted = { ...stepA, startTime: time.stepAStart };
export const stepASuccessful = { ...stepAStarted, endTime: time.stepAEnd };

export const stepB = {
	description: 'Do Step B',
	onStep: ( dispatch, actionList ) => {
		dispatch( { type: '%% action b %%' } );
		dispatch( actionListStepSuccess( actionList ) );
	},
};
export const stepBStarted = { ...stepB, startTime: time.stepBStart };
export const stepBSuccessful = { ...stepBStarted, endTime: time.stepBEnd };

export const stepC = {
	description: 'Do Step C',
	onStep: ( dispatch, actionList ) => {
		dispatch( { type: '%% action c %%' } );
		dispatch( actionListStepSuccess( actionList ) );
	},
};
export const stepCStarted = { ...stepC, startTime: time.stepCStart };
export const stepCSuccessful = { ...stepCStarted, endTime: time.stepCEnd };

export const stepEError = { message: 'Bad error message. Very bad.' };
export const stepE = {
	description: 'Do Error Step',
	onStep: ( dispatch, actionList ) => {
		dispatch( { type: '%% error action %%' } );
		dispatch( actionListStepFailure( actionList, stepEError ) );
	},
};
export const stepEStarted = { ...stepE, startTime: time.stepEStart };
export const stepEFailed = { ...stepEStarted, endTime: time.stepEEnd, error: stepEError };
