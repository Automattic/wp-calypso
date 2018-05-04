/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { IMPORTS_IMPORT_LOCK, IMPORTS_IMPORT_UNLOCK } from 'state/action-types';

describe( 'reducer', () => {
	describe( IMPORTS_IMPORT_LOCK, () => {
		test( 'adds the value of the provided `importerId` as a key to the stae object with the value of `true`', () => {
			const previousState = {};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_LOCK,
				importerId: 'testImporter',
			} );

			expect( state ).to.eql( {
				testImporter: true,
			} );
		} );

		test( 'overwrites any existing values for the provided `importerId` in the state object', () => {
			const previousState = {
				testImporter: false,
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_LOCK,
				importerId: 'testImporter',
			} );

			expect( state ).to.eql( {
				testImporter: true,
			} );
		} );

		test( 'does not result in a state change if the importerId is not provided in the action payload', () => {
			const previousState = {
				testImporter: false,
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_LOCK,
			} );

			expect( state ).to.eql( previousState );
		} );
	} );

	describe( IMPORTS_IMPORT_UNLOCK, () => {
		test( 'adds the value of the provided `importerId` as a key to the state object with the value of `false`', () => {
			const previousState = {};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_UNLOCK,
				importerId: 'testImporter',
			} );

			expect( state ).to.eql( {
				testImporter: false,
			} );
		} );

		test( 'overwrites any existing values for the provided `importerId` in the state object', () => {
			const previousState = {
				testImporter: true,
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_UNLOCK,
				importerId: 'testImporter',
			} );

			expect( state ).to.eql( {
				testImporter: false,
			} );
		} );

		test( 'does not result in a state change if the importerId is not provided in the action payload', () => {
			const previousState = {
				testImporter: false,
			};

			const state = reducer( previousState, {
				type: IMPORTS_IMPORT_UNLOCK,
			} );

			expect( state ).to.eql( previousState );
		} );
	} );
} );
