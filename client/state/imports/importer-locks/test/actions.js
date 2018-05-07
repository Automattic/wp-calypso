/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { cancelImport, resetImport, startMappingAuthors, startImporting } from '../actions';
import {
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RESET,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_START_IMPORTING,
} from 'state/action-types';

describe( 'actions', () => {
	describe( '#cancelImport', () => {
		test( `returns an ${ IMPORTS_IMPORT_CANCEL } action`, () => {
			const importerId = 'testImporterId';
			const action = cancelImport( importerId );

			expect( action ).to.eql( {
				type: IMPORTS_IMPORT_CANCEL,
				importerId,
			} );
		} );
	} );

	describe( '#resetImport', () => {
		test( `returns an ${ IMPORTS_IMPORT_RESET } action`, () => {
			const importerId = 'testImporterId';
			const action = resetImport( importerId );

			expect( action ).to.eql( {
				type: IMPORTS_IMPORT_RESET,
				importerId,
			} );
		} );
	} );

	describe( '#startMappingAuthors', () => {
		test( `returns an ${ IMPORTS_AUTHORS_START_MAPPING } action`, () => {
			const importerId = 'testImporterId';
			const action = startMappingAuthors( importerId );

			expect( action ).to.eql( {
				type: IMPORTS_AUTHORS_START_MAPPING,
				importerId,
			} );
		} );
	} );

	describe( '#startImporting', () => {
		test( `returns an ${ IMPORTS_START_IMPORTING } action`, () => {
			const importerId = 'testImporterId';
			const action = startImporting( importerId );

			expect( action ).to.eql( {
				type: IMPORTS_START_IMPORTING,
				importerId,
			} );
		} );
	} );
} );
