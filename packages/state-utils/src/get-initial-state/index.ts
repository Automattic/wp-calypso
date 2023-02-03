import type { Action, AnyAction, Reducer } from 'redux';

export default function getInitialState< TState, TAction extends Action = AnyAction >(
	reducer: Reducer< TState, TAction >
): TState {
	return reducer( undefined, { type: '@@calypso/INIT' } );
}
