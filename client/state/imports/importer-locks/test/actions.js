/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { lockImporter, unlockImporter } from '../actions';
import { IMPORTS_IMPORT_LOCK, IMPORTS_IMPORT_UNLOCK } from 'state/action-types';

describe( 'actions', () => {
	describe( '#lockImporter', () => {
		test( `returns an ${ IMPORTS_IMPORT_LOCK } action`, () => {
			const importerId = 'testImporterId';
			const action = lockImporter( importerId );

			expect( action ).to.eql( {
				type: IMPORTS_IMPORT_LOCK,
				importerId,
			} );
		} );
	} );

	describe( '#unlockImporter', () => {
		test( `returns an ${ IMPORTS_IMPORT_LOCK } action`, () => {
			const importerId = 'testImporterId';
			const action = unlockImporter( importerId );

			expect( action ).to.eql( {
				type: IMPORTS_IMPORT_UNLOCK,
				importerId,
			} );
		} );
	} );
} );
