import { getInitialState } from '@automattic/state-utils';
import type { Reducer, UnknownAction, Action } from 'redux';

export interface SerializableReducer< TState = any, TAction extends UnknownAction = Action >
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

export function deserialize< TState >(
	reducer: SerializableReducer< TState >,
	persisted: any
): TState {
	if ( ! reducer.deserialize ) {
		return getInitialState( reducer );
	}

	return reducer.deserialize( persisted );
}
