/** @format */
/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { IMPORTS_IMPORT_LOCK, IMPORTS_IMPORT_UNLOCK } from 'state/action-types';

const INITIAL_STATE = Object.freeze( {} );

const lockedImports = createReducer( INITIAL_STATE, {
	[ IMPORTS_IMPORT_LOCK ]: ( state, { importerId } ) => ( {
		...state,
		[ importerId ]: true,
	} ),
	[ IMPORTS_IMPORT_UNLOCK ]: ( state, { importerId } ) => ( {
		...state,
		[ importerId ]: false,
	} ),
} );

export default lockedImports;
