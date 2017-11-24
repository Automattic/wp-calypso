/** @format */

/**
 * External dependencies
 */
import { uniq } from 'lodash';

/**
 * Internal dependencies
 */
import { DESERIALIZE, DESERIALIZE_PART, SERIALIZE } from 'state/action-types';
import { createReducer, withSchemaValidation } from 'state/utils';

/**
 * Module variables
 */
const extensionReducers = {};

/**
 * (TODO: Improve this) A reducer that keeps undeserialized data.
 */
const placeholderReducer = createReducer( null, {
	[ SERIALIZE ]: state => {
		return state._undeserialized;
	},
	[ DESERIALIZE ]: state => {
		return {
			_undeserialized: state,
		};
	},
} );

function getDeserializeReducer( reducer ) {
	return createReducer( null, {
		[ SERIALIZE ]: state => {
			return state._undeserialized;
		},
		[ DESERIALIZE_PART ]: state => {
			const initialState = state == null ? undefined : state._undeserialized;
			return reducer( initialState, { type: DESERIALIZE } );
		},
	} );
}

export const loadExtensionReducer = function( store, key, reducer ) {
	const { schema, hasCustomPersistence } = reducer;
	const reducerToSet = hasCustomPersistence ? reducer : withSchemaValidation( schema, reducer );
	extensionReducers[ key ] = getDeserializeReducer( reducerToSet );
	store.dispatch( { type: DESERIALIZE_PART } );
	extensionReducers[ key ] = reducerToSet;
};

/**
 * The extensionsReducer function works much like a reducer returned by combineReducers,
 * with the exception that it takes reducers hold in the extensionReducers object,
 * and it forgives undefined keys by calling placeholderReducer to handle these keys.
 *
 * This make the function non-pure but it allow us to keep the unloaded extenstion states persistent,
 * and swap the reducer when it loads.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action object
 * @return {Object}        Updated state
 */
export default function extensionsReducer( state = {}, action ) {
	const keys = uniq( Object.keys( extensionReducers ).concat( Object.keys( state ) ) );
	let hasChanged = false;
	const nextState = {};
	for ( let i = 0; i < keys.length; i++ ) {
		const key = keys[ i ];
		const reducerForKey = extensionReducers[ key ] ? extensionReducers[ key ] : placeholderReducer;
		const previousStateForKey = state[ key ];
		const nextStateForKey = reducerForKey( previousStateForKey, action );
		nextState[ key ] = nextStateForKey;
		hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	}
	return hasChanged ? nextState : state;
}
extensionsReducer.hasCustomPersistence = true;
