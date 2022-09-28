import { combineReducers } from '@wordpress/data';
import { findIndex } from 'lodash';
import type { Action } from './actions';
import type { SubscriberState } from './types';
import type { Reducer } from 'redux';

export const subscriber: Reducer< SubscriberState, Action > = ( state = {}, action ) => {
	/**
	 * ↓ Import subscribers
	 */
	if ( action.type === 'IMPORT_CSV_SUBSCRIBERS_START' ) {
		return Object.assign( {}, state, {
			import: {
				inProgress: true,
			},
		} );
	} else if ( action.type === 'IMPORT_CSV_SUBSCRIBERS_START_SUCCESS' ) {
		const imports = Array.from( state.imports || [] );
		imports.push( {
			id: action.jobId,
			status: 'pending',
		} );
		return Object.assign( {}, state, {
			import: {
				inProgress: true,
				job: { id: action.jobId },
			},
			imports,
		} );
	} else if ( action.type === 'IMPORT_CSV_SUBSCRIBERS_START_FAILED' ) {
		return Object.assign( {}, state, {
			import: {
				inProgress: false,
				error: action.error,
			},
		} );
	} else if ( action.type === 'IMPORT_CSV_SUBSCRIBERS_UPDATE' ) {
		if ( action.job )
			return Object.assign( {}, state, {
				import: {
					inProgress: true,
					job: action.job,
				},
			} );

		return Object.assign( {}, state, {
			import: {
				inProgress: false,
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
			hydrated: true,
		} );
	}

	return state;
};

const reducers = combineReducers( { subscriber } );

export type State = ReturnType< typeof reducers >;

export default reducers;
