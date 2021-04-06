/**
 * External dependencies
 */
import { get, mapValues, reduce } from 'lodash';
import { combineReducers as combine } from 'redux'; // eslint-disable-line no-restricted-imports
import type { Reducer, AnyAction, Action } from 'redux';

/**
 * Internal dependencies
 */
import { serialize, deserialize } from './serialize';
import type { SerializableReducer } from './serialize';
import { APPLY_STORED_STATE } from 'calypso/state/action-types';
import { SerializationResult } from 'calypso/state/serialization-result';

interface CombinedReducer extends SerializableReducer {
	storageKey?: string;
	addReducer?: ( keyPath: string[], reducer: Reducer ) => CombinedReducer;
	getStorageKeys?: () => Generator< string | { storageKey: string; reducer: Reducer } >;
}

/**
 * Create a new reducer from original `reducers` by adding a new `reducer` at `keyPath`
 *
 * @param origReducer Original reducer to copy `storageKey` and other flags from
 * @param reducers Object with reducer names as keys and reducer functions as values that
 *   is used as parameter to `combineReducers` (the original Redux one and our extension, too).
 * @returns The function to be attached as `addReducer` method to the
 *   result of `combineReducers`.
 */
export function addReducer(
	origReducer: CombinedReducer,
	reducers: Record< string, CombinedReducer >
) {
	return ( keyPath: string[], reducer: CombinedReducer ): CombinedReducer => {
		// extract the first key from keyPath and dive recursively into the reducer tree
		const [ key, ...restKeys ] = keyPath;

		const existingReducer = reducers[ key ];
		let newReducer;

		// if there is an existing reducer at this path, we'll recursively call `addReducer`
		// until we reach the final destination in the tree.
		if ( existingReducer ) {
			// we reached the final destination in the tree and another reducer already lives there!
			if ( restKeys.length === 0 ) {
				throw new Error( `Reducer with key '${ key }' is already registered` );
			}

			if ( ! existingReducer.addReducer ) {
				throw new Error(
					"New reducer can be added only into a reducer created with 'combineReducers'"
				);
			}

			newReducer = existingReducer.addReducer( restKeys, reducer );
		} else {
			// for the remaining keys in the keyPath, create a nested reducer:
			// if `restKeys` is `[ 'a', 'b', 'c']`, then the result of this `reduceRight` is:
			// ```js
			// combineReducers( {
			//   a: combineReducers ( {
			//     b: combineReducers( {
			//       c: reducer
			//     } )
			//   })
			// })
			// ```
			newReducer = restKeys.reduceRight(
				( subreducer, subkey ) => combineReducers( { [ subkey ]: subreducer } ),
				reducer
			);
		}

		const newCombinedReducer: CombinedReducer = combineReducers( {
			...reducers,
			[ key ]: newReducer,
		} );

		// Preserve the storageKey of the updated reducer
		newCombinedReducer.storageKey = origReducer.storageKey;

		return newCombinedReducer;
	};
}

/**
 * Returns a single reducer function that ensures that persistence is opt-in and that
 * has support for adding reducers dynamically.
 *
 * @example
 * ```js
 * const age = ( state = 0, action ) =>
 *     GROW === action.type
 *         ? state + 1
 *         : state
 * const height = ( state = 150, action ) =>
 *     GROW === action.type
 *         ? state + 1
 *         : state
 *
 * const combinedReducer = combineReducers( {
 *     age,
 *     height
 * } );
 *
 * // returns `{ age: 0, height: 150 }`, the initial state
 * deserialize( combinedReducer, { age: 6, height: 123 } );
 * // returns `undefined`, no serialization
 * serialize( combinedReducer, { age: 6, height: 123 } );
 * // returns `{ age: 7, height: 124 }`, handling a normal action
 * combinedReducer( { age:  6, height: 123 } ), { type: GROW } );
 * ```
 *
 * Persistence must be enabled explicitly with the `withPersistence` helper.
 *
 * @example
 * ```js
 * const date = withPersistence(
 *   ( state = new Date( 0 ), action ) => {
 *     switch ( action.type ) {
 *       case 'GROW':
 *         return new Date( state.getTime() + 1 );
 *       default:
 *         return state;
 *   },
 *   {
 *     serialize: state => state.getTime(),
 *     deserialize: persisted => {
 *       if ( isValidStateWithSchema( persisted, schema ) ) {
 *         return new Date( persisted );
 *       }
 *       return new Date( 0 );
 *     },
 *   }
 * );
 *
 * const combinedReducer = combineReducers( {
 *     date,
 *     height
 * } );
 *
 * deserialize( combinedReducer, { date: -5, height: -5 } ); // { date: new Date( 0 ), height: 150 };
 * deserialize( combinedReducer, { date: -5, height: 123 } ); // { date: new Date( 0 ), height: 150 };
 * deserialize( combinedReducer, { date:  6, height: 123 } ); // { date: new Date( 6 ), height: 150 };
 * serialize( combinedReducer, { date: new Date( 6 ), height: 123 } ); // { date: 6 };
 * combinedReducer( { date: new Date( 6 ), height: 123 } ), { type: GROW } ); // { date: new Date( 7 ), height: 124 };
 * ```
 *
 * @param reducers - object containing the reducers to merge
 * @returns - Returns the combined reducer function
 */
export function combineReducers( reducers: Record< string, Reducer > ): CombinedReducer {
	const combined = combine( reducers );

	const combinedReducer: CombinedReducer = ( state, action ) => {
		switch ( action.type ) {
			case APPLY_STORED_STATE:
				return applyStoredState( reducers, state, action );

			default:
				return combined( state, action );
		}
	};

	combinedReducer.serialize = ( state ) => serializeState( reducers, state );
	combinedReducer.deserialize = ( persisted ) => deserializeState( reducers, persisted );
	combinedReducer.addReducer = addReducer( combinedReducer, reducers );
	combinedReducer.getStorageKeys = getStorageKeys( reducers );

	return combinedReducer;
}

function applyStoredState< TState, TAction extends AnyAction = Action >(
	reducers: Record< string, CombinedReducer >,
	state: TState,
	action: TAction
) {
	let hasChanged = false;
	const nextState = mapValues( reducers, ( reducer, key ) => {
		// Replace the value for the key we want to init with action.storedState.
		if ( reducer.storageKey === action.storageKey ) {
			hasChanged = true;
			return action.storedState;
		}

		// Descend into nested state levels, possibly the storageKey will be found there?
		const prevStateForKey = get( state, key );
		const nextStateForKey = reducer( prevStateForKey, action );
		hasChanged = hasChanged || nextStateForKey !== prevStateForKey;
		return nextStateForKey;
	} );

	// return identical state if the stored state didn't get applied in this reducer
	return hasChanged ? nextState : state;
}

function getStorageKeys(
	reducers: Record< string, CombinedReducer >
): () => Generator< string | { storageKey: string; reducer: Reducer } > {
	return function* () {
		for ( const reducer of Object.values( reducers ) ) {
			if ( reducer.storageKey ) {
				yield { storageKey: reducer.storageKey, reducer };
			}

			if ( reducer.getStorageKeys ) {
				yield* reducer.getStorageKeys();
			}
		}
	};
}

// State serialization is very similar to running a reducer on the state, except some behaviors
// that are slightly different from `combineReducers` from Redux:
// - `undefined` is a valid value returned from `serialize()`, but `combineReducers`
//   would throw an exception when seeing it.
// - if a particular subreducer serializes to `undefined`, then that property won't be included
//   in the result object at all.
// - if none of the subreducers produced anything to persist, the combined result will be
//   `undefined` rather than an empty object.
// - if the state to serialize is `undefined` (happens when some key in state is missing)
//   the serialized value is `undefined` and there's no need to reduce anything.
function serializeState< TState = any >(
	reducers: Record< string, CombinedReducer >,
	state: Record< keyof typeof reducers, TState >
): SerializationResult | undefined {
	if ( state === undefined ) {
		return undefined;
	}

	return reduce(
		reducers,
		( result, reducer, reducerKey ) => {
			const serialized = serialize( reducer, state[ reducerKey ] );
			if ( serialized !== undefined ) {
				if ( ! result ) {
					// instantiate the result object only when it's going to have at least one property
					result = new SerializationResult();
				}
				if ( reducer.storageKey ) {
					result.addKeyResult( reducer.storageKey, serialized );
				} else {
					result.addRootResult( reducerKey, serialized );
				}
			}
			return result;
		},
		undefined as SerializationResult | undefined
	);
}

function deserializeState(
	reducers: Record< string, SerializableReducer >,
	persisted: Record< string, any >
) {
	return mapValues( reducers, ( reducer, reducerKey ) =>
		deserialize( reducer, persisted?.[ reducerKey ] )
	);
}
