/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import isImporterLocked from '../is-importer-locked';

describe( '#isImporterLocked', () => {
	test( 'returns false if the importerLocks object does not exist', () => {
		const importerId = 'testId';
		const state = deepFreeze( {
			imports: {},
		} );

		expect( isImporterLocked( state, importerId ) ).to.be.false;
	} );

	test( 'returns false if the importerLocks object is empty', () => {
		const importerId = 'testId';
		const state = deepFreeze( {
			imports: {
				importerLocks: {},
			},
		} );

		expect( isImporterLocked( state, importerId ) ).to.be.false;
	} );

	test( 'returns false if the importerLocks object has a value of false for the matching importerId', () => {
		const importerId = 'testId';
		const state = deepFreeze( {
			imports: {
				importerLocks: {
					[ importerId ]: false,
				},
			},
		} );

		expect( isImporterLocked( state, importerId ) ).to.be.false;
	} );

	test( 'returns true if the importerLocks object has a value of true for the matching importerId', () => {
		const importerId = 'testId';
		const state = deepFreeze( {
			imports: {
				importerLocks: {
					[ importerId ]: true,
				},
			},
		} );

		expect( isImporterLocked( state, importerId ) ).to.be.true;
	} );
} );
