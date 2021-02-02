/**
 * External dependencies
 */
import { isEqual, mapValues, omit, omitBy, reduce } from 'lodash';
import type { Reducer, Action, AnyAction } from 'redux';

/**
 * WordPress dependencies
 */
import warn from '@wordpress/warning';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from '../action-types';
import { SerializationResult } from '../serialization-result';

type CalypsoInitAction = Action< '@@calypso/INIT' >;
type SerializeAction = Action< 'SERIALIZE' >;
type DeserializeAction = Action< 'DESERIALIZE' >;

export type KeyedReducerAction< TAction, TKeyedAction = Record< string, unknown > > =
	| TAction
	| ( CalypsoInitAction & Partial< TKeyedAction > )
	| ( SerializeAction & Partial< TKeyedAction > )
	| ( DeserializeAction & Partial< TKeyedAction > );

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
 * If no key exists whose name matches the given lodash style keyPath
 * then this super-reducer will abort and return the
 * previous state.
 *
 * The keyed reducer handles the SERIALIZE and DESERIALIZE actions specially and makes sure
 * that Calypso state persistence works as expected (ignoring empty and initial state,
 * serialization into multiple storage keys etc.)
 *
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
 *
 * @param keyPath lodash-style path to the key in action referencing item in state map
 * @param reducer applied to referenced item in state map
 * @returns super-reducer applying reducer over map of keyed items
 */
const keyedReducer = <
	TKey extends string | number,
	TState,
	TAction extends Action = AnyAction,
	TKeyedAction = Record< string, unknown >
>(
	keyPath: keyof KeyedReducerAction< TAction, TKeyedAction > | ( ( action: TAction ) => TKey ),
	reducer: Reducer< TState | undefined, KeyedReducerAction< TAction, TKeyedAction > >
): Reducer< Record< TKey, TState >, KeyedReducerAction< TAction, TKeyedAction > > => {
	// some keys are invalid
	if ( ! [ 'string', 'function' ].includes( typeof keyPath ) ) {
		throw new TypeError(
			`Key name passed into \`keyedReducer\` must be a string or a function but I detected a ${ typeof keyPath }`
		);
	}

	if ( typeof keyPath === 'string' && ! ( keyPath as string ).length ) {
		throw new TypeError( 'Key name passed into `keyedReducer` must not be empty' );
	}

	if ( 'function' !== typeof reducer ) {
		throw new TypeError(
			`Reducer passed into \`keyedReducer\` must be a function but I detected a ${ typeof reducer }`
		);
	}

	const initialState = reducer( undefined, { type: '@@calypso/INIT' } );

	return (
		state: Record< TKey, TState > = {} as Record< TKey, TState >,
		action: KeyedReducerAction< TAction, TKeyedAction >
	): Record< TKey, TState > => {
		if ( action.type === SERIALIZE ) {
			const serialized = reduce(
				state,
				( result, itemValue, itemKey ) => {
					const serializedValue = reducer( itemValue, action );
					if ( serializedValue !== undefined && ! isEqual( serializedValue, initialState ) ) {
						if ( ! result ) {
							// instantiate the result object only when it's going to have at least one property
							result = new SerializationResult();
						}
						result.addRootResult( itemKey, serializedValue );
					}
					return result;
				},
				undefined as SerializationResult< TState > | undefined
			);
			return ( serialized as unknown ) as Record< TKey, TState >;
		}

		if ( action.type === DESERIALIZE ) {
			return omitBy(
				mapValues( state, ( item ) => reducer( item, action ) ),
				( a ) => a === undefined || isEqual( a, initialState )
			) as Record< TKey, TState >;
		}

		let itemKey: TKey | undefined = undefined;
		if ( typeof keyPath === 'function' ) {
			try {
				itemKey = keyPath( action as TAction );
			} catch ( e ) {
				warn( e );
				itemKey = undefined;
			}
		} else {
			itemKey = action[ keyPath ] as TKey;
		}

		// if the action doesn't contain a valid reference
		// then return without any updates
		if ( undefined === itemKey ) {
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
			return state.hasOwnProperty( itemKey )
				? ( omit( state, itemKey ) as Record< TKey, TState > )
				: state;
		}

		// otherwise immutably update the super-state
		return {
			...state,
			[ itemKey ]: newItemState,
		};
	};
};

export default keyedReducer;
