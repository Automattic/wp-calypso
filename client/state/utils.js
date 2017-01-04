/**
 * External dependencies
 */
import validator from 'is-my-json-valid';
import { merge, flow, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
} from './action-types';
import warn from 'lib/warn';

export function isValidStateWithSchema( state, schema ) {
	const validate = validator( schema );
	const valid = validate( state );
	if ( ! valid ) {
		warn( 'state validation failed for state:', state, 'with reason:', validate.errors );
	}
	return valid;
}

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
 * If no key exists whose name matches the given keyName
 * then this super-reducer will abort and return the
 * previous state.
 *
 * If some action should apply to every single item
 * in the map of keyed objects, this utility cannot be
 * used as it will only reduce the referenced item.
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
 * @param {string} keyName name of key in action referencing item in state map
 * @param {function} reducer applied to referenced item in state map
 * @return {function} super-reducer applying reducer over map of keyed items
 */
export const keyedReducer = ( keyName, reducer ) => {
	// some keys are invalid
	if ( 'string' !== typeof keyName ) {
		throw new TypeError( `Key name passed into ``keyedReducer`` must be a string but I detected a ${ typeof keyName }` );
	}

	if ( ! keyName.length ) {
		throw new TypeError( 'Key name passed into `keyedReducer` must have a non-zero length but I detected an empty string' );
	}

	if ( 'function' !== typeof reducer ) {
		throw new TypeError( `Reducer passed into ``keyedReducer`` must be a function but I detected a ${ typeof reducer }` );
	}

	const initialState = reducer( undefined, { type: '@@calypso/INIT' } );

	return ( state = {}, action ) => {
		// don't allow coercion of key name: null => 0
		if ( ! action.hasOwnProperty( keyName ) ) {
			return state;
		}

		// the action must refer to some item in the map
		const itemKey = action[ keyName ];

		// if the action doesn't contain a valid reference
		// then return without any updates
		if ( null === itemKey || undefined === itemKey ) {
			return state;
		}

		// pass the old sub-state from that item into the reducer
		// we need this to update state and also to compare if
		// we had any changes, thus the initialState
		const oldItemState = state.hasOwnProperty( itemKey )
			? state[ itemKey ]
			: initialState;

		const newItemState = reducer( oldItemState, action );

		// and do nothing if the new sub-state matches the old sub-state
		// or if it matches the default state for the reducer, in which
		// case nothing happened and we don't need to store it
		if (
			newItemState === oldItemState ||
			newItemState === initialState
		) {
			return state;
		}

		// otherwise immutably update the super-state
		return {
			...state,
			[ itemKey ]: newItemState,
		};
	};
};

/**
 * Given an action object or thunk, returns an updated object or thunk which
 * will include additional data in the action (as provided) when dispatched.
 *
 * @param  {(Function|Object)} action Action object or thunk
 * @param  {Object}            data   Additional data to include in action
 * @return {(Function|Object)}        Augmented action object or thunk
 */
export function extendAction( action, data ) {
	if ( 'function' !== typeof action ) {
		return merge( {}, action, data );
	}

	return ( dispatch ) => {
		const newDispatch = flow( partialRight( extendAction, data ), dispatch );
		return action( newDispatch );
	};
}

/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object. Defines default
 * serialization (persistence) handlers based on the presence of a schema.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   customHandlers Object mapping action types to state
 *                                   action handlers
 * @param  {?Object}  schema         JSON schema object for deserialization
 *                                   validation
 * @return {Function}                Reducer function
 */
export function createReducer( initialState = null, customHandlers = {}, schema = null ) {
	// Define default handlers for serialization actions. If no schema is
	// provided, always return the initial state. Otherwise, allow for
	// serialization and validate on deserialize.
	let defaultHandlers;
	if ( schema ) {
		defaultHandlers = {
			[ SERIALIZE ]: ( state ) => state,
			[ DESERIALIZE ]: ( state ) => {
				if ( isValidStateWithSchema( state, schema ) ) {
					return state;
				}

				warn( 'state validation failed - check schema used for:', customHandlers );

				return initialState;
			}
		};
	} else {
		defaultHandlers = {
			[ SERIALIZE ]: () => initialState,
			[ DESERIALIZE ]: () => initialState
		};
	}

	const handlers = {
		...defaultHandlers,
		...customHandlers
	};

	// When custom serialization behavior is provided, we assume that it may
	// involve heavy logic (mapping, converting from Immutable instance), so
	// we cache the result and only regenerate when state has changed.
	if ( customHandlers[ SERIALIZE ] ) {
		let lastState, lastSerialized;
		handlers[ SERIALIZE ] = ( state, action ) => {
			if ( state === lastState ) {
				return lastSerialized;
			}

			const serialized = customHandlers[ SERIALIZE ]( state, action );
			lastState = state;
			lastSerialized = serialized;
			return serialized;
		};
	}

	return ( state = initialState, action ) => {
		const { type } = action;

		if ( 'production' !== process.env.NODE_ENV && 'type' in action && ! type ) {
			throw new TypeError( 'Reducer called with undefined type.' +
				' Verify that the action type is defined in state/action-types.js' );
		}

		if ( handlers.hasOwnProperty( type ) ) {
			return handlers[ type ]( state, action );
		}

		return state;
	};
}

/**
 * Creates schema-validating reducer
 *
 * Use this to wrap simple reducers with a schema-based
 * validation check when loading the initial state from
 * persistent storage.
 *
 * When this wraps a reducer with a known JSON schema,
 * it will intercept the DESERIALIZE action (on app boot)
 * and check if the persisted state is still valid state.
 * If so it will return the persisted state, otherwise
 * it will return the initial state computed from
 * passing the null action.
 *
 * @example
 * const ageReducer = ( state = 0, action ) =>
 *     GROW === action.type
 *         ? state + 1
 *         : state
 *
 * const schema = { type: 'number', minimum: 0 }
 *
 * export const age = withSchemaValidation( schema, age )
 *
 * ageReducer( -5, { type: DESERIALIZE } ) === -5
 * age( -5, { type: DESERIALIZE } ) === 0
 * age( 23, { type: DESERIALIZE } ) === 23
 *
 * @param {object} schema JSON-schema description of state
 * @param {function} reducer normal reducer from ( state, action ) to new state
 * @returns {function} wrapped reducer handling validation on DESERIALIZE
 */
export const withSchemaValidation = ( schema, reducer ) => ( state, action ) => {
	if ( DESERIALIZE === action.type ) {
		return state && isValidStateWithSchema( state, schema )
			? state
			: reducer( undefined, { type: '@@calypso/INIT' } );
	}

	return reducer( state, action );
};
