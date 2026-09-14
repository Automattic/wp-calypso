import { mapValues, omit, omitBy } from '@automattic/js-utils';
import isEqual from 'fast-deep-equal/es6';
import { SerializationResult } from 'calypso/state/serialization-result';
import { serialize, deserialize, SerializableReducer } from './serialize';
import { withPersistence } from './with-persistence';
import type { Action, AnyAction } from 'redux';

type CalypsoInitAction = Action< '@@calypso/INIT' >;
export type KeyedReducerAction< TAction extends Action > = TAction | CalypsoInitAction;

/**
 * Creates a super-reducer as a map of reducers over keyed objects
 *
 * Use this when wanting to write reducers that operate
 * on a single object as if it lived in isolation when
 * really it lives in a map of similar objects referenced
 * by some predesignated key or id. This could be used
 * for example when reducing properties on a site object
 * wherein we have many sites keyed by site id.
 *
 * Note! This will only apply the supplied reducer to
 * the item referenced by the supplied key in the action.
 *
 * If no key exists whose name matches the given dot-separated keyPath
 * then this super-reducer will abort and return the
 * previous state.
 *
 * The keyed reducer implements the `serialize` and `deserialize` methods and makes sure
 * that Calypso state persistence works as expected (ignoring empty and initial state,
 * serialization into multiple storage keys etc.)
 * @example
 * const age = ( state = 0, action ) =>
 *     GROW === action.type
 *         ? state + 1
 *         : state
 *
 * const title = ( state = 'grunt', action ) =>
 *     PROMOTION === action.type
 *         ? action.title
 *         : state
 *
 * const userReducer = combineReducers( {
 *     age,
 *     title,
 * } )
 *
 * export default keyedReducer( 'username', userReducer )
 *
 * dispatch( { type: GROW, username: 'hunter02' } )
 *
 * state.users === {
 *     hunter02: {
 *         age: 1,
 *         title: 'grunt',
 *     }
 * }
 * @param {string} keyPath dot-separated path to the key in action referencing item in state map (e.g. `meta.dataLayer.requestKey`); bracket or quoted path syntax (e.g. `a[0].b`) is not supported
 * @param {Function} reducer applied to referenced item in state map
 * @returns {Function} super-reducer applying reducer over map of keyed items
 */
export const keyedReducer = < TState, TAction extends AnyAction = Action >(
	keyPath: string,
	reducer: SerializableReducer< TState, Action >
): SerializableReducer< Record< string | number, TState >, TAction > => {
	// some keys are invalid
	if ( 'string' !== typeof keyPath ) {
		throw new TypeError(
			`Key name passed into \`keyedReducer\` must be a string but I detected a ${ typeof keyPath }`
		);
	}

	if ( ! keyPath.length ) {
		throw new TypeError(
			'Key name passed into `keyedReducer` must have a non-zero length but I detected an empty string'
		);
	}

	if ( 'function' !== typeof reducer ) {
		throw new TypeError(
			`Reducer passed into \`keyedReducer\` must be a function but I detected a ${ typeof reducer }`
		);
	}

	const initialState = reducer( undefined, { type: '@@calypso/INIT' } );

	// Parse the dot-separated `keyPath` once, rather than on every dispatched action.
	const keyPathSegments = keyPath.split( '.' );

	const combinedReducer = (
		state: Record< string | number, TState > = {},
		action: KeyedReducerAction< TAction >
	) => {
		// don't allow coercion of key name: null => 0; walk each path segment.
		const itemKey = keyPathSegments.reduce< unknown >(
			( value, key ) => ( value as Record< string, unknown > )?.[ key ],
			action
		) as string | number | undefined | null;

		// if the action doesn't contain a valid reference
		// then return without any updates
		if ( null === itemKey || undefined === itemKey ) {
			return state;
		}

		// pass the old sub-state from that item into the reducer
		// we need this to update state and also to compare if
		// we had any changes, thus the initialState
		const oldItemState = state[ itemKey ];
		const newItemState = reducer( oldItemState, action );

		// and do nothing if the new sub-state matches the old sub-state
		if ( newItemState === oldItemState ) {
			return state;
		}

		// remove key from state if setting to undefined or back to initial state
		// if it didn't exist anyway, then do nothing.
		if ( undefined === newItemState || isEqual( newItemState, initialState ) ) {
			return state.hasOwnProperty( itemKey ) ? omit( state, itemKey ) : state;
		}

		// otherwise immutably update the super-state
		return {
			...state,
			[ itemKey ]: newItemState,
		};
	};

	return withPersistence( combinedReducer, {
		serialize: ( state ) =>
			Object.entries< TState >( state ?? {} ).reduce(
				( result, [ itemKey, itemValue ] ) => {
					const serializedValue = serialize( reducer, itemValue );
					if ( serializedValue !== undefined && ! isEqual( serializedValue, initialState ) ) {
						if ( ! result ) {
							// instantiate the result object only when it's going to have at least one property
							result = new SerializationResult();
						}
						result.addRootResult( itemKey, serializedValue );
					}
					return result;
				},
				undefined as SerializationResult | undefined
			),
		deserialize: ( persisted ) =>
			omitBy(
				mapValues( persisted, ( item ) => deserialize( reducer, item ) ),
				( a ) => a === undefined || isEqual( a, initialState )
			),
	} );
};
