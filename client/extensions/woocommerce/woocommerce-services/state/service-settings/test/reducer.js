/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { setFormProperty, setAllPristine } from '../actions';
import { updateField } from '../values/actions';

const initialState = {
	textObj: {
		field: {
			id: 'PCKG_A',
			dimensions: {
				width: 10,
				length: 11,
				height: 23,
			},
			value: 1122,
		},
	},
	pristine: {
		field: true,
	},
};

describe( 'Settings reducer', () => {
	afterEach( () => {
		// make sure the state hasn't been mutated
		// after each test
		expect( initialState ).to.eql( {
			textObj: {
				field: {
					id: 'PCKG_A',
					dimensions: {
						width: 10,
						length: 11,
						height: 23,
					},
					value: 1122,
				},
			},
			pristine: {
				field: true,
			},
		} );
	} );

	it( 'SET_FORM_PROPERTY', () => {
		const key = 'textObj';
		const val = { id: 'newID', newfield: 'some new value' };
		const action = setFormProperty( key, val );
		const state = reducer( initialState, action );

		expect( state ).to.eql( {
			textObj: {
				id: 'newID',
				newfield: 'some new value',
			},
			pristine: {
				field: true,
			},
		} );
	} );

	it( 'Clears fields status on settings state change', () => {
		const initialErrorState = Object.assign( { fieldsStatus: [ 'data.title' ] }, initialState );
		const action = updateField( 'some_key', 'some value' );
		const state = reducer( initialErrorState, action );

		expect( state ).to.not.have.property( 'fieldsStatus' );
	} );

	it( 'UPDATE_FIELD marks pristine false', () => {
		const action = updateField( 'some_key', 'some value' );
		const state = reducer( initialState, action );

		expect( state ).to.have.deep.property( 'pristine.some_key', false );
	} );

	it( 'SET_ALL_PRISTINE', () => {
		const action = setAllPristine( false );
		const state = reducer( initialState, action );

		expect( state ).to.eql( {
			textObj: {
				field: {
					id: 'PCKG_A',
					dimensions: {
						width: 10,
						length: 11,
						height: 23,
					},
					value: 1122,
				},
			},
			pristine: {
				field: false,
			},
		} );
	} );
} );
