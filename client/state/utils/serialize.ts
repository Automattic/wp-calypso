/**
 * External dependencies
 */
import { getInitialState } from '@automattic/state-utils';
import type { Reducer, AnyAction } from 'redux';

export type SerializableReducer< TState, TAction extends AnyAction > = Reducer<
	TState,
	TAction
> & {
	serialize?: ( state: TState ) => any;
	deserialize?: ( persisted: any ) => TState;
};

export function serialize< TState, TAction extends AnyAction >(
	reducer: SerializableReducer< TState, TAction >,
	state: TState
): any {
	if ( ! reducer.serialize ) {
		return undefined;
	}

	return reducer.serialize( state );
}

export function deserialize< TState, TAction extends AnyAction >(
	reducer: SerializableReducer< TState, TAction >,
	persisted: any
): TState {
	if ( ! reducer.deserialize ) {
		return getInitialState( reducer );
	}

	return reducer.deserialize( persisted );
}
