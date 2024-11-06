import type { SerializableReducer } from './serialize';
import type { AnyAction } from 'redux';

export interface SerializeOptions< TState > {
	serialize?: ( state: TState ) => any;
	deserialize?: ( persisted: any ) => TState;
}

/**
 * Add persistence support to a reducer, with optional custom serialization methods
 * @param reducer Reducer to add persistence to
 * @param options Object with optional custom serialization methods
 * @param options.serialize Custom serialization method
 * @param options.deserialize Custom deserialization method
 */
export function withPersistence< TState, TAction extends AnyAction >(
	reducer: SerializableReducer< TState, TAction >,
	{ serialize, deserialize }: SerializeOptions< TState > = {}
): SerializableReducer< TState, TAction > {
	const wrappedReducer = reducer.bind( null );
	wrappedReducer.serialize = serialize || reducer.serialize || ( ( state ) => state );
	wrappedReducer.deserialize = deserialize || reducer.deserialize || ( ( persisted ) => persisted );
	return wrappedReducer;
}
