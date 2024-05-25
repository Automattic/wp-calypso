import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getStepData = ( state: State ) => state.stepData;
