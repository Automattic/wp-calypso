/**
 * External dependencies
 */
import { get, mapValues, pick, reduce, reduceRight } from 'lodash';
import { combineReducers as combine } from 'redux'; // eslint-disable-line no-restricted-imports

/**
 * Internal dependencies
 */
import { APPLY_STORED_STATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { SerializationResult } from 'state/serialization-result';
import { withoutPersistence } from './without-persistence';

/**
 * Create a new reducer from original `reducers` by adding a new `reducer` at `keyPath`
 *
 * @param {Function} origReducer Original reducer to copy `storageKey` and other flags from
 * @param {object} reducers Object with reducer names as keys and reducer functions as values that
 *   is used as parameter to `combineReducers` (the original Redux one and our extension, too).
 * @returns {Function} The function to be attached as `addReducer` method to the
 *   result of `combineReducers`.
 */
export function addReducer( origReducer, reducers ) {
	return ( keyPath, reducer ) => {
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
			newReducer = reduceRight(
				restKeys,
				( subreducer, subkey ) => createCombinedReducer( { [ subkey ]: subreducer } ),
				setupReducerPersistence( reducer )
			);
		}

		const newCombinedReducer = createCombinedReducer( { ...reducers, [ key ]: newReducer } );

		// Preserve the storageKey of the updated reducer
		newCombinedReducer.storageKey = origReducer.storageKey;

		return newCombinedReducer;
	};
}

/**
 * Returns a single reducing function that ensures that persistence is opt-in.
 * If you don't need state to be stored, simply use this method instead of
 * combineReducers from redux. This function uses the same interface.
 * *
 *
 * @example
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
 * combinedReducer( { age: -5, height: -5 } ), { type: DESERIALIZE } ); // { age: 0, height: 150 };
 * combinedReducer( { age: -5, height: 123 } ), { type: DESERIALIZE } ); // { age: 0, height: 150 };
 * combinedReducer( { age:  6, height: 123 } ), { type: DESERIALIZE } ); // { age: 6, height: 150 };
 * combinedReducer( { age:  6, height: 123 } ), { type: SERIALIZE } ); // { age: 6, height: 150 };
 * combinedReducer( { age:  6, height: 123 } ), { type: GROW } ); // { age: 7, height: 124 };
 *
 * If the reducer explicitly handles the SERIALIZE and DESERIALIZE actions, set
 * the hasCustomPersistence property to true on the reducer.
 *
 * @example
 * const date = ( state = new Date( 0 ), action ) => {
 * 	switch ( action.type ) {
 * 		case 'GROW':
 * 			return new Date( state.getTime() + 1 );
 * 		case SERIALIZE:
 * 			return state.getTime();
 * 		case DESERIALIZE:
 * 			if ( isValidStateWithSchema( state, schema ) ) {
 * 				return new Date( state );
 * 			}
 * 			return new Date( 0 );
 * 		default:
 * 			return state;
 * 	}
 * };
 * date.hasCustomPersistence = true;
 *
 * const combinedReducer = combineReducers( {
 *     date,
 *     height
 * } );
 *
 * combinedReducer( { date: -5, height: -5 } ), { type: DESERIALIZE } ); // { date: new Date( 0 ), height: 150 };
 * combinedReducer( { date: -5, height: 123 } ), { type: DESERIALIZE } ); // { date: new Date( 0 ), height: 150 };
 * combinedReducer( { date:  6, height: 123 } ), { type: DESERIALIZE } ); // { date: new Date( 6 ), height: 150 };
 * combinedReducer( { date: new Date( 6 ), height: 123 } ), { type: SERIALIZE } ); // { date: 6, height: 150 };
 * combinedReducer( { date: new Date( 6 ), height: 123 } ), { type: GROW } ); // { date: new Date( 7 ), height: 124 };
 *
 * @param {object} reducers - object containing the reducers to merge
 * @returns {Function} - Returns the combined reducer function
 */
export function combineReducers( reducers ) {
	// set up persistence of reducers passed from app and then create a combined one
	return createCombinedReducer( mapValues( reducers, setupReducerPersistence ) );
}

function applyStoredState( reducers, state, action ) {
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

function createCombinedReducer( reducers ) {
	const combined = combine( reducers );

	const combinedReducer = ( state, action ) => {
		switch ( action.type ) {
			case SERIALIZE:
				return serializeState( reducers, state, action );

			case DESERIALIZE:
				return combined( pick( state, Object.keys( reducers ) ), action );

			case APPLY_STORED_STATE:
				return applyStoredState( reducers, state, action );

			default:
				return combined( state, action );
		}
	};

	combinedReducer.hasCustomPersistence = true;
	combinedReducer.addReducer = addReducer( combinedReducer, reducers );
	combinedReducer.getStorageKeys = getStorageKeys( reducers );

	return combinedReducer;
}

function getStorageKeys( reducers ) {
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

// SERIALIZE needs behavior that's slightly different from `combineReducers` from Redux:
// - `undefined` is a valid value returned from SERIALIZE reducer, but `combineReducers`
//   would throw an exception when seeing it.
// - if a particular subreducer returns `undefined`, then that property won't be included
//   in the result object at all.
// - if none of the subreducers produced anything to persist, the combined result will be
//   `undefined` rather than an empty object.
// - if the state to serialize is `undefined` (happens when some key in state is missing)
//   the serialized value is `undefined` and there's no need to reduce anything.
function serializeState( reducers, state, action ) {
	if ( state === undefined ) {
		return undefined;
	}

	return reduce(
		reducers,
		( result, reducer, reducerKey ) => {
			const serialized = reducer( state[ reducerKey ], action );
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
		undefined
	);
}

/*
 * Wrap the reducer with appropriate persistence code. If it has the `hasCustomPersistence` flag,
 * it means it's already set up and we don't need to make any changes.
 */
function setupReducerPersistence( reducer ) {
	if ( reducer.hasCustomPersistence ) {
		return reducer;
	}

	if ( reducer.schema ) {
		throw new Error(
			'`schema` properties in reducers are no longer supported. Please wrap reducers with withSchemaValidation.'
		);
	}

	return withoutPersistence( reducer );
}
