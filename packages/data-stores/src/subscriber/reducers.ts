import { combineReducers } from '@wordpress/data';
import { findIndex } from 'lodash';
import type { Action } from './actions';
import type { SubscriberState } from './types';
import type { Reducer } from 'redux';

const subscriber: Reducer< SubscriberState, Action > = ( state = {}, action ) => {
	/**
	 * ↓ Import subscribers
	 */
	if ( action.type === 'IMPORT_CSV_SUBSCRIBERS_START' ) {
		return Object.assign( {}, state, {
			import: {
				inProgress: true,
				error: '',
			},
		} );
	} else if ( action.type === 'IMPORT_CSV_SUBSCRIBERS_SUCCESS' ) {
		return Object.assign( {}, state, {
			import: {
				inProgress: false,
			},
		} );
	} else if ( action.type === 'IMPORT_CSV_SUBSCRIBERS_FAILED' ) {
		return Object.assign( {}, state, {
			import: {
				inProgress: false,
				error: action.error,
			},
		} );
	}

	/**
	 * ↓ Add subscribers
	 */
	if ( action.type === 'ADD_SUBSCRIBERS_START' ) {
		return Object.assign( {}, state, {
			add: { inProgress: true },
		} );
	} else if ( action.type === 'ADD_SUBSCRIBERS_SUCCESS' ) {
		return Object.assign( {}, state, {
			add: {
				inProgress: false,
				response: action.response,
			},
		} );
	} else if ( action.type === 'ADD_SUBSCRIBERS_FAILED' ) {
		return Object.assign( {}, state, {
			add: { inProgress: false },
		} );
	}

	/**
	 * ↓ Get import
	 */
	if ( action.type === 'GET_SUBSCRIBERS_IMPORT_SUCCESS' ) {
		const imports = state.imports ? Array.from( state.imports ) : [];
		const i = findIndex( imports, { id: action.importJob.id } );
		i !== -1 ? ( imports[ i ] = action.importJob ) : imports.push( action.importJob );

		return Object.assign( {}, state, {
			imports,
		} );
	}

	/**
	 * ↓ Get imports
	 */
	if ( action.type === 'GET_SUBSCRIBERS_IMPORTS_SUCCESS' ) {
		return Object.assign( {}, state, {
			imports: action.imports,
		} );
	}

	return state;
};

const reducers = combineReducers( { subscriber } );

export type State = ReturnType< typeof reducers >;

export default reducers;
