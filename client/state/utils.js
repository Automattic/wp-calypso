/** @format */

/**
 * External dependencies
 */

import validator from 'is-my-json-valid';
import {
	flow,
	forEach,
	get,
	includes,
	isEmpty,
	isEqual,
	mapValues,
	merge,
	omit,
	omitBy,
	partialRight,
	reduce,
} from 'lodash';
import { combineReducers as combine } from 'redux'; // eslint-disable-line wpcalypso/import-no-redux-combine-reducers
import LRU from 'lru';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import warn from 'lib/warn';

export function isValidStateWithSchema( state, schema, debugInfo ) {
	const validate = validator( schema, {
		greedy: process.env.NODE_ENV !== 'production',
		verbose: process.env.NODE_ENV !== 'production',
	} );
	const valid = validate( state );
	if ( ! valid && process.env.NODE_ENV !== 'production' ) {
		const msgLines = [ 'State validation failed.', 'State: %o', '' ];
		const substitutions = [ state ];

		forEach( validate.errors, ( { field, message, schemaPath, value } ) => {
			// data.myField is required
			msgLines.push( '%s %s' );
			substitutions.push( field, message );

			// Found: { my: 'state' }
			msgLines.push( 'Found: %o' );
			substitutions.push( value );

			// Violates rule: { type: 'boolean' }
			if ( ! isEmpty( schemaPath ) ) {
				msgLines.push( 'Violates rule: %o' );
				substitutions.push( get( schema, schemaPath ) );
			}
			msgLines.push( '' );
		} );

		if ( ! isEmpty( debugInfo ) ) {
			msgLines.push( 'Source: %o' );
			substitutions.push( debugInfo );
		}

		warn( msgLines.join( '\n' ), ...substitutions );
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
 * If no key exists whose name matches the given lodash style keyPath
 * then this super-reducer will abort and return the
 * previous state.
 *
 * If some action should apply to every single item
 * in the map of keyed objects, then that action type
 * should be supplied in the list of `globalActions`
 * These will apply to every item in the collection
 * and they may not have the necessary key: for
 * example, the DESERIALIZE and SERIALIZE actions
 * may apply to all items and are included by default.
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
 * @example
 * const reducer = keyedReducer( 'username', userReducer, [ DESERIALIZE, SERIALIZE ] );
 * reducer.hasCustomerPersistence = true;
 *
 * // now every item can decide what to do for persistence
 *
 * @param {string} keyPath lodash-style path to the key in action referencing item in state map
 * @param {Function} reducer applied to referenced item in state map
 * @param {Array} globalActions set of types which apply to every item in the collection
 * @return {Function} super-reducer applying reducer over map of keyed items
 */
export const keyedReducer = ( keyPath, reducer, globalActions = [ SERIALIZE, DESERIALIZE ] ) => {
	// some keys are invalid
	if ( 'string' !== typeof keyPath ) {
		throw new TypeError(
			`Key name passed into ``keyedReducer`` must be a string but I detected a ${ typeof keyName }`
		);
	}

	if ( ! keyPath.length ) {
		throw new TypeError(
			'Key name passed into `keyedReducer` must have a non-zero length but I detected an empty string'
		);
	}

	if ( 'function' !== typeof reducer ) {
		throw new TypeError(
			`Reducer passed into ``keyedReducer`` must be a function but I detected a ${ typeof reducer }`
		);
	}

	const initialState = reducer( undefined, { type: '@@calypso/INIT' } );

	return ( state = {}, action ) => {
		if ( globalActions && includes( globalActions, action.type ) ) {
			return omitBy(
				mapValues( state, item => reducer( item, action ) ),
				a => a === undefined || isEqual( a, initialState )
			);
		}

		// don't allow coercion of key name: null => 0
		const itemKey = get( action, keyPath, undefined );

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

	return dispatch => {
		const newDispatch = flow( partialRight( extendAction, data ), dispatch );
		return action( newDispatch );
	};
}

function getInitialState( reducer ) {
	return reducer( undefined, { type: '@@calypso/INIT' } );
}

function isValidSerializedState( schema, reducer, state ) {
	// The stored state is often equal to initial state of the reducer. Because initial state
	// is always valid, we can validate much faster by just comparing the two states. The full
	// JSON schema check is much slower and we do it only on nontrivial states.
	// Note that we need to serialize the initial state to make a correct check. For reducers
	// with custom persistence, the initial state can be arbitrary non-serializable object. We
	// need to compare two serialized objects.
	const serializedInitialState = reducer( undefined, { type: SERIALIZE } );
	if ( isEqual( state, serializedInitialState ) ) {
		return true;
	}

	return isValidStateWithSchema( state, schema );
}

/**
 * Creates a schema-validating reducer
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
 * export const age = withSchemaValidation( schema, ageReducer )
 *
 * ageReducer( -5, { type: DESERIALIZE } ) === -5
 * age( -5, { type: DESERIALIZE } ) === 0
 * age( 23, { type: DESERIALIZE } ) === 23
 *
 * @param {object} schema JSON-schema description of state
 * @param {function} reducer normal reducer from ( state, action ) to new state
 * @returns {function} wrapped reducer handling validation on DESERIALIZE
 */
export const withSchemaValidation = ( schema, reducer ) => {
	if ( process.env.NODE_ENV !== 'production' && ! schema ) {
		throw new Error( 'null schema passed to withSchemaValidation' );
	}

	const wrappedReducer = ( state, action ) => {
		if ( action.type === DESERIALIZE ) {
			if ( state === undefined ) {
				// If the state is not present in the stored data, initialize it with the
				// initial state. Note that calling `reducer( undefined, DESERIALIZE )` here
				// would be incorrect for reducers with custom deserialization. DESERIALIZE
				// expects plain JS object on input, but in this case, it would be defaulted
				// to the reducer's initial state. And that's a custom object, e.g.,
				// `Immutable.Map` or `PostQueryManager`.
				return getInitialState( reducer );
			}

			// If the stored state fails JSON schema validation, treat it as if it was
			// `undefined`, i.e., ignore it and replace with initial state.
			if ( ! isValidSerializedState( schema, reducer, state ) ) {
				return getInitialState( reducer );
			}
			// Otherwise, fall through to calling the regular reducer
		}

		return reducer( state, action );
	};

	//used to propagate actions properly when combined in combineReducersWithPersistence
	wrappedReducer.hasCustomPersistence = true;

	return wrappedReducer;
};

/**
 * Wraps a reducer such that it won't persist any state to the browser's local storage
 *
 * @example prevent a simple reducer from persisting
 * const age = ( state = 0, { type } ) =>
 *   GROW === type
 *     ? state + 1
 *     : state
 *
 * export default combineReducers( {
 *   age: withoutPersistence( age )
 * } )
 *
 * @example preventing a large reducer from persisting
 * const posts = withoutPersistence( keyedReducer( 'postId', post ) )
 *
 * @param {Function} reducer original reducer
 * @returns {Function} wrapped reducer
 */
export const withoutPersistence = reducer => {
	const wrappedReducer = ( state, action ) => {
		switch ( action.type ) {
			case SERIALIZE:
				return undefined;
			case DESERIALIZE:
				return getInitialState( reducer );
			default:
				return reducer( state, action );
		}
	};
	wrappedReducer.hasCustomPersistence = true;

	return wrappedReducer;
};

/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object. Defines default
 * serialization (persistence) handlers based on the presence of a schema.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   handlers       Object mapping action types to state action handlers
 * @param  {?Object}  schema         JSON schema object for deserialization validation
 * @return {Function}                Reducer function
 */
export function createReducer( initialState, handlers, schema ) {
	const reducer = ( state = initialState, action ) => {
		const { type } = action;

		if ( 'production' !== process.env.NODE_ENV && 'type' in action && ! type ) {
			throw new TypeError(
				'Reducer called with undefined type.' +
					' Verify that the action type is defined in state/action-types.js'
			);
		}

		if ( handlers.hasOwnProperty( type ) ) {
			return handlers[ type ]( state, action );
		}

		return state;
	};

	if ( schema ) {
		return withSchemaValidation( schema, reducer );
	}

	if ( ! handlers[ SERIALIZE ] && ! handlers[ DESERIALIZE ] ) {
		return withoutPersistence( reducer );
	}

	// if the reducer has at least one custom persistence handler (SERIALIZE or DESERIALIZE)
	// it's treated as a reducer with custom persistence.
	reducer.hasCustomPersistence = true;
	return reducer;
}

/**
 * Returns a single reducing function that ensures that persistence is opt-in.
 * If you don't need state to be stored, simply use this method instead of
 * combineReducers from redux. This function uses the same interface.
 *
 * To mark that a reducer's state should be persisted, add the related JSON
 * schema as a property on the reducer.
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
 * const schema = { type: 'number', minimum: 0 };
 *
 * age.schema = schema;
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
 * @returns {function} - Returns the combined reducer function
 */
export function combineReducers( reducers ) {
	const validatedReducers = mapValues( reducers, next => {
		if ( next.hasCustomPersistence ) {
			return next;
		}

		if ( next.schema ) {
			return withSchemaValidation( next.schema, next );
		}

		return withoutPersistence( next );
	} );

	const combined = combine( validatedReducers );
	const combinedWithSerializer = ( state, action ) => {
		// SERIALIZE needs behavior that's slightly different from `combineReducers` from Redux:
		// - `undefined` is a valid value returned from SERIALIZE reducer, but `combineReducers`
		//   would throw an exception when seeing it.
		// - if a particular subreducer returns `undefined`, then that property won't be included
		//   in the result object at all.
		// - if none of the subreducers produced anything to persist, the combined result will be
		//   `undefined` rather than an empty object.
		// - if the state to serialize is `undefined` (happens when some key in state is missing)
		//   the serialized value is `undefined` and there's no need to reduce anything.
		if ( action.type === SERIALIZE ) {
			if ( state === undefined ) {
				return undefined;
			}
			return reduce(
				validatedReducers,
				( result, reducer, key ) => {
					const serialized = reducer( state[ key ], action );
					if ( serialized !== undefined ) {
						if ( ! result ) {
							// instantiate the result object only when it's going to have at least one property
							result = {};
						}
						result[ key ] = serialized;
					}
					return result;
				},
				undefined
			);
		}

		return combined( state, action );
	};
	combinedWithSerializer.hasCustomPersistence = true;
	return combinedWithSerializer;
}

/**
 * Creates a caching action creator
 *
 * @example Here's a caching action creator:
 * export const fetchOAuth2ClientData = cachingActionCreatorFactory(
 *	clientId => wpcom.undocumented().oauth2ClientId( clientId ),
 *	dispatch => clientId => dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST, clientId, } ),
 *	dispatch => wpcomResponse => dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS, data: wpcomResponse } ),
 *	dispatch => wpcomError => {
 *		const error = {
 *			message: wpcomError.message,
 *			code: wpcomError.error,
 *		};
 *
 *		dispatch( {
 *			type: OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
 *			error,
 *		} );
 *
 *		return Promise.reject( error );
 *	},
 *);
 *
 * @param {Function} worker a worker function that returns the promise ( param1, param2, ... ) => Promise
 * @param {Function} loadingActionCreator an action creator for before the work is performed of the following signature:
 * 					dispatch => ( param1, param2, ... ) => dispatch( ... ),
 * @param {Function} successActionCreator an action creator for the success case of the work performed of the following signature:
 * 					dispatch => ( param1, param2, ... ) => dispatch( ... ),
 * @param {Function} failureActionCreator an action creator for the failure case of the work performed of the following signature:
 * 					dispatch => ( param1, param2, ... ) => dispatch( ... ),
 * @param {Function} parametersHashFunction a hash function for params, default is just array's join
 * @param {Object} cacheOptions options that passed to LRU cache constructor
 *
 * @return {Function} a function that can be used as an action creator of the following signature:
 * 					( param1, param2, ... ) => dispatch => Promise
 */
export const cachingActionCreatorFactory = (
	worker,
	loadingActionCreator,
	successActionCreator,
	failureActionCreator,
	parametersHashFunction = params => params.join( '' ),
	cacheOptions = {
		// those are passed to LRU ctor directly
		max: 100,
		maxAge: 2 * 60 * 60, // 2 hours
	}
) => {
	const cache = new LRU( cacheOptions );

	return ( ...params ) => dispatch => {
		loadingActionCreator( dispatch )( ...params );

		const cacheKey = parametersHashFunction( params );
		const cachedValue = cache.get( cacheKey );
		const resultPromise = cachedValue ? Promise.resolve( cachedValue ) : worker( ...params );

		return resultPromise.then( result => {
			cache.set( cacheKey, result );
			return successActionCreator( dispatch )( result );
		}, failureActionCreator( dispatch ) ); // we don't cache failures
	};
};
