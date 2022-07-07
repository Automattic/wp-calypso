export const setStepData = ( data: any ) => ( {
	type: 'SET_STEP_DATA' as const,
	data,
} );

export const clearStepData = () => ( {
	type: 'CLEAR_STEP_DATA' as const,
} );

export type StepperInternalAction =
	| ReturnType< typeof setStepData | typeof clearStepData >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
