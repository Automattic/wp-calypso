import { STARTUP_STATES_RANDOM_CLEAR_STATE_NOTIFIED } from '../action-types';
import type { AnyAction } from 'redux';

export interface IStartupFlags {
	isStateRandomlyCleared: boolean;
}

const defaultState = { isStateRandomlyCleared: false };
export function startupFlagsReducer( state: IStartupFlags = defaultState, action: AnyAction ) {
	switch ( action.type ) {
		case STARTUP_STATES_RANDOM_CLEAR_STATE_NOTIFIED: {
			return { ...state, isStateRandomlyCleared: true };
		}
	}
	return state;
}
