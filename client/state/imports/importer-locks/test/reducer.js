/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	IMPORTS_IMPORT_CANCEL,
	IMPORTS_IMPORT_RESET,
	IMPORTS_AUTHORS_START_MAPPING,
	IMPORTS_START_IMPORTING,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'sets the value for the `importerId` as `true` for the `IMPORTS_IMPORT_CANCEL` action', () => {
		const previousState = {};

		const state = reducer( previousState, {
			type: IMPORTS_IMPORT_CANCEL,
			importerId: 'testImporter',
		} );

		expect( state ).to.eql( {
			testImporter: true,
		} );
	} );

	test( 'sets the value for the `importerId` as `true` for the `IMPORTS_IMPORT_RESET` action', () => {
		const previousState = {};

		const state = reducer( previousState, {
			type: IMPORTS_IMPORT_RESET,
			importerId: 'testImporter',
		} );

		expect( state ).to.eql( {
			testImporter: true,
		} );
	} );

	test( 'sets the value for the `importerId` as `true` for the `IMPORTS_AUTHORS_START_MAPPING` action', () => {
		const previousState = {};

		const state = reducer( previousState, {
			type: IMPORTS_AUTHORS_START_MAPPING,
			importerId: 'testImporter',
		} );

		expect( state ).to.eql( {
			testImporter: true,
		} );
	} );

	test( 'sets the value for the `importerId` as `false` for the `IMPORTS_START_IMPORTING` action', () => {
		const previousState = {};

		const state = reducer( previousState, {
			type: IMPORTS_START_IMPORTING,
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
			type: IMPORTS_IMPORT_CANCEL,
		} );

		expect( state ).to.eql( previousState );
	} );
} );
