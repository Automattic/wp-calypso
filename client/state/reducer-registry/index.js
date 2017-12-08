/** @format */

/**
 * External dependencies
 */
import { reduce, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import { DESERIALIZE, DESERIALIZE_PART, SERIALIZE } from 'state/action-types';
import { createReducer, withSchemaValidation } from 'state/utils';

/**
 * Module variables
 */
const registeredReducers = Object.create( null );
let defaultStoreDispatch;

/**
 * Pleaseholder reducer keeps undeserialized data in the in-memory state tree
 * so that we could keep the serialized data persistent before loading the actual
 * reducers and its schema, and allow the state to be deserialized when they are
 * loaded (see below.)
 */
const placeholderReducer = createReducer( null, {
	[ SERIALIZE ]: state => {
		return state._initialState;
	},
	[ DESERIALIZE ]: state => {
		return {
			_initialState: state,
		};
	},
} );

/**
 * This method returns a reducer that respond to DESERIALIZE_PART action type,
 * so that we could deserialize the state with the newly loaded reducer.
 * @param  {Function} reducer The newly loaded reducer
 * @return {Function}         Reducer that responds to DESERIALIZE_PART action type.
 */
function getDeserializeReducer( reducer ) {
	return createReducer( null, {
		[ SERIALIZE ]: state => {
			return state._initialState;
		},
		[ DESERIALIZE_PART ]: state => {
			const initialState = state == null ? undefined : state._initialState;
			return reducer( initialState, { type: DESERIALIZE } );
		},
	} );
}

/**
 * Add reducers into a combined reducer returned by combineReducersAndAddLater.
 * @param {object} reducersToAdd - object containing the additional reducers to merge
 * @param {string} name - Unique name to identify the reducer collection
 * @param {object} registry - Registry to use, default to module variable
 * @param {object} dispatch - Redux store.dispatch() method to call, default to module variable
 */
export const addReducers = function( reducersToAdd, name = 'root', registry = registeredReducers, dispatch = defaultStoreDispatch ) {
	const reducers = registry[ name ];
	if ( ! reducers ) {
		throw new Error( `Reducer registry name ${ name } does not exist.` );
	}
	const keys = Object.keys( reducersToAdd ).filter( key => ! reducers[ key ] );
	if ( ! keys.length ) {
		return;
	}

	const reducersToSet = keys.map( key => {
		const reducer = reducersToAdd[ key ];
		const { schema, hasCustomPersistence } = reducer;
		return {
			key,
			reducer: hasCustomPersistence ? reducer : withSchemaValidation( schema, reducer ),
		};
	} );

	if ( dispatch ) {
		// Store has initialized, we will need to deserialize the part.
		reducersToSet.forEach( ( { key, reducer } ) => {
			reducers[ key ] = getDeserializeReducer( reducer );
		} );

		dispatch( { type: DESERIALIZE_PART } );
	}

	reducersToSet.forEach( ( { key, reducer } ) => {
		reducers[ key ] = reducer;
	} );
};

/**
 * combineReducersAndAddLater returns a reducer much like the one returned by
 * combineReducers, with the exception that you may add into the reducers collection
 * later. It also forgives undefined keys by calling placeholderReducer to handle
 * these keys.
 *
 * This make the reducer function non-pure but it allow us to keep the unloaded
 * states persistent, and swap the reducer when it loads.
 *
 * @param {object} initialReducers - object containing the reducers to merge
 * @param {string} name - Unique name to identify this reducer collection
 * @param {object} registry - Registry to use, default to module variable
 * @returns {function} - Returns the combined reducer function
 */
export const combineReducersAndAddLater = function( initialReducers, name = 'root', registry = registeredReducers ) {
	if ( registry[ name ] ) {
		throw new Error( `Duplicate reducer registry name ${ name }.` );
	}

	const reducers = ( registry[ name ] = reduce(
		initialReducers,
		( validated, next, key ) => {
			const { schema, hasCustomPersistence } = next;
			return {
				...validated,
				[ key ]: hasCustomPersistence ? next : withSchemaValidation( schema, next ),
			};
		},
		{}
	) );

	const reducer = function( state = {}, action ) {
		const keys = uniq( Object.keys( reducers ).concat( Object.keys( state ) ) );
		let hasChanged = false;
		const nextState = {};
		for ( let i = 0; i < keys.length; i++ ) {
			const key = keys[ i ];
			const reducerForKey = reducers[ key ] ? reducers[ key ] : placeholderReducer;
			const previousStateForKey = state[ key ];
			const nextStateForKey = reducerForKey( previousStateForKey, action );
			nextState[ key ] = nextStateForKey;
			hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
		}
		return hasChanged ? nextState : state;
	};
	reducer.hasCustomPersistence = true;
	return reducer;
};

export const reducerRegistryEnhancer = next => ( reducer, initialState ) => {
	const store = next( reducer, initialState );

	defaultStoreDispatch = action => {
		return store.dispatch( action );
	};

	return store;
};
