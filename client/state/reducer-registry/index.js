/** @format */

/**
 * External dependencies
 */
import { get, reduce, uniq } from 'lodash';

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
 * Placeholder reducer keeps serialized initial state in the in-memory state tree.
 * When the actual reducers and its schema loads, we will pass the initial state
 * to the reducer and allow the state to be deserialized (see below.)
 *
 * It also handles the SERIALIZE action type by return the saved initial state,
 * so we could keep the initial state data persistent.
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
 * Returns a reducer that respond to DESERIALIZE_PART action type,
 * so that we could deserialize the state with the newly loaded reducer.
 * @param  {Function} reducer The newly loaded reducer
 * @return {Function}         Reducer that responds to DESERIALIZE_PART action type.
 */
function createDeserializeReducer( reducer ) {
	return createReducer( null, {
		[ SERIALIZE ]: state => {
			return state._initialState;
		},
		[ DESERIALIZE_PART ]: state => {
			const initialState = get( state, '_initialState', undefined );
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
export const addReducers = function(
	reducersToAdd,
	name = 'root',
	registry = registeredReducers,
	dispatch = defaultStoreDispatch
) {
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
			reducers[ key ] = createDeserializeReducer( reducer );
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
export const combineReducersAndAddLater = function(
	initialReducers,
	name = 'root',
	registry = registeredReducers
) {
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
		// This mirrors the original Redux implementation
		// https://github.com/reactjs/redux/blob/87071fd4ab71acc4fdd8b3db37d2d7ff08b724a3/src/combineReducers.js#L165-L179
		// and keeps the for loop (instead of replacing it with forEach) for speed.
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
