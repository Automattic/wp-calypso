import { combineReducers } from '@wordpress/data';
import { SiteIntent } from '../onboard/constants';
import { StepperInternalAction } from './actions';
import type { Reducer } from 'redux';

type StepData = Record< string, unknown > & {
	path: string;
	intent: SiteIntent;
	previousStep: string;
};

export const stepData: Reducer< StepData | undefined, StepperInternalAction > = (
	state = undefined,
	action
) => {
	if ( action.type === 'SET_STEP_DATA' ) {
		return action.data;
	}
	if ( action.type === 'CLEAR_STEP_DATA' ) {
		return undefined;
	}
	return state;
};

const reducer = combineReducers( {
	stepData,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
