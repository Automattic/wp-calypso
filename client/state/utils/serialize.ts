/**
 * External dependencies
 */
import { getInitialState } from '@automattic/state-utils';
import type { Reducer, AnyAction, Action } from 'redux';

export type SerializableReducer< TState = any, TAction extends AnyAction = Action > = Reducer<
	TState,
	TAction
> & {
	serialize?: ( state: TState ) => any;
	deserialize?: ( persisted: any ) => TState;
};

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
