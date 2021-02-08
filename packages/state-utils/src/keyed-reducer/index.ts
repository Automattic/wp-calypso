/**
 * External dependencies
 */
import { get, isEqual, mapValues, omit, omitBy, reduce } from 'lodash';
import type { PropertyPath } from 'lodash';
import type { Reducer, Action, AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from '../action-types';
import SerializationResult from '../serialization-result';

type CalypsoInitAction = Action< '@@calypso/INIT' >;
type SerializeAction = Action< 'SERIALIZE' >;
type DeserializeAction = Action< 'DESERIALIZE' >;

export type KeyedReducerAction< TAction extends Action > =
	| TAction
	| CalypsoInitAction
	| SerializeAction
	| DeserializeAction;

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
const keyedReducer = < TState, TAction extends Action = AnyAction >(
	keyPath: PropertyPath,
	reducer: Reducer< TState, KeyedReducerAction< TAction > >
): Reducer< Record< string | number, TState >, KeyedReducerAction< TAction > > => {
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

	return (
		state: Record< string | number, TState > = {} as Record< string | number, TState >,
		action: KeyedReducerAction< TAction >
	): Record< string | number, TState > => {
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
				undefined as SerializationResult | undefined
			);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore We're doing some magic stuff here with serialization and deserialization so it's safe to just ignore this error
			return serialized;
		}

		if ( action.type === DESERIALIZE ) {
			return omitBy(
				mapValues( state, ( item ) => reducer( item, action ) ),
				( a ) => a === undefined || isEqual( a, initialState )
			) as Record< string | number, TState >;
		}

		// don't allow coercion of key name: null => 0
		const itemKey = get( action, keyPath, undefined ) as string | number;

		// if the action doesn't contain a valid reference
		// then return without any updates
		if ( null === itemKey || undefined === itemKey ) {
			return state;
		}

		// pass the old sub-state from that item into the reducer
		// we need this to update state and also to compare if
		// we had any changes, thus the initialState
		const oldItemState = state[ itemKey ] as TState;
		const newItemState = reducer( oldItemState, action );

		// and do nothing if the new sub-state matches the old sub-state
		if ( newItemState === oldItemState ) {
			return state;
		}

		// remove key from state if setting to undefined or back to initial state
		// if it didn't exist anyway, then do nothing.
		if ( undefined === newItemState || isEqual( newItemState, initialState ) ) {
			return state.hasOwnProperty( itemKey )
				? ( omit( state, itemKey ) as Record< string | number, TState > )
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
