import { getInitialState } from '@automattic/state-utils';
import type { Reducer, AnyAction, Action } from 'redux';

export interface SerializableReducer< TState = any, TAction extends AnyAction = Action >
	extends Reducer< TState, TAction > {
	serialize?: ( state: TState ) => any;
	deserialize?: ( persisted: any ) => TState;
}

export function serialize< TState >( reducer: SerializableReducer< TState >, state: TState ): any {
	if ( ! reducer.serialize ) {
		return undefined;
	}

	return reducer.serialize( state );
}

export function deserialize< TState, TAction extends AnyAction = Action >(
	reducer: SerializableReducer< TState, TAction >,
	persisted: any
): TState {
	if ( ! reducer.deserialize ) {
		return getInitialState< TState, TAction >( reducer );
	}

	return reducer.deserialize( persisted );
}
