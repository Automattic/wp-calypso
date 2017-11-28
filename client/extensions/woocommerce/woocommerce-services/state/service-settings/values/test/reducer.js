/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import formValues from '../reducer';
import {
	updateField,
	removeField,
	addArrayFieldItem,
} from '../actions';

const initialState = {
	testField: 'testValue',
	testArrayKey: [
		{
			id: 'ALPHA',
			testItemField: 'AYE',
		},
		{
			id: 'BETA',
			testItemField: 'BEE',
		},
	],
	testPckgs: {
		PCKG_A: {
			id: 'PCKG_A',
			dimensions: {
				width: 10,
				length: 11,
				height: 23,
			},
			value: 1122,
		},
	},
};

describe( 'Form values reducer', () => {
	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		expect( initialState ).to.eql( {
			testField: 'testValue',
			testArrayKey: [
				{
					id: 'ALPHA',
					testItemField: 'AYE',
				},
				{
					id: 'BETA',
					testItemField: 'BEE',
				},
			],
			testPckgs: {
				PCKG_A: {
					id: 'PCKG_A',
					dimensions: {
						width: 10,
						length: 11,
						height: 23,
					},
					value: 1122,
				},
			},
		} );
	} );

	it( 'UPDATE_FIELD', () => {
		const path = 'testField';
		const val = 'testValue2';
		const action = updateField( path, val );
		const state = formValues( initialState, action );

		expect( state ).to.eql( {
			testField: 'testValue2',
			testArrayKey: [
				{
					id: 'ALPHA',
					testItemField: 'AYE',
				},
				{
					id: 'BETA',
					testItemField: 'BEE',
				},
			],
			testPckgs: {
				PCKG_A: {
					id: 'PCKG_A',
					dimensions: {
						width: 10,
						length: 11,
						height: 23,
					},
					value: 1122,
				},
			},
		} );
	} );

	it( 'UPDATE_FIELD (add field)', () => {
		const path = 'testField2';
		const val = 'FOO_BAR';
		const action = updateField( path, val );
		const state = formValues( initialState, action );

		expect( state ).to.eql( {
			testField: 'testValue',
			testField2: 'FOO_BAR',
			testArrayKey: [
				{
					id: 'ALPHA',
					testItemField: 'AYE',
				},
				{
					id: 'BETA',
					testItemField: 'BEE',
				},
			],
			testPckgs: {
				PCKG_A: {
					id: 'PCKG_A',
					dimensions: {
						width: 10,
						length: 11,
						height: 23,
					},
					value: 1122,
				},
			},
		} );
	} );

	it( 'REMOVE_FIELD', () => {
		const path = 'testField';

		const action = removeField( path );
		const state = formValues( initialState, action );

		expect( state ).to.eql( {
			testArrayKey: [
				{
					id: 'ALPHA',
					testItemField: 'AYE',
				},
				{
					id: 'BETA',
					testItemField: 'BEE',
				},
			],
			testPckgs: {
				PCKG_A: {
					id: 'PCKG_A',
					dimensions: {
						width: 10,
						length: 11,
						height: 23,
					},
					value: 1122,
				},
			},
		} );
	} );

	it( 'ADD_ARRAY_FIELD_ITEM', () => {
		const path = 'testArrayKey';
		const item = {
			id: 'OMEGA',
			testItemField: 'OHH',
		};

		const action = addArrayFieldItem( path, item );
		const state = formValues( initialState, action );

		expect( state ).to.eql( {
			testField: 'testValue',
			testArrayKey: [
				{
					id: 'ALPHA',
					testItemField: 'AYE',
				},
				{
					id: 'BETA',
					testItemField: 'BEE',
				},
				{
					id: 'OMEGA',
					testItemField: 'OHH',
				},
			],
			testPckgs: {
				PCKG_A: {
					id: 'PCKG_A',
					dimensions: {
						width: 10,
						length: 11,
						height: 23,
					},
					value: 1122,
				},
			},
		} );
	} );
} );
