/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	updateField,
	removeField,
	addArrayFieldItem,
	UPDATE_FIELD,
	REMOVE_FIELD,
	ADD_ARRAY_FIELD_ITEM,
} from '../actions';

describe( 'Form value actions', () => {
	it( '#updateField()', () => {
		const path = 'testField';
		const value = 'testValue';

		const action = updateField( path, value );

		expect( action ).to.eql( {
			type: UPDATE_FIELD,
			path: 'testField',
			value: 'testValue',
		} );
	} );

	it( '#removeField()', () => {
		const path = 'testField';
		const action = removeField( path );

		expect( action ).to.eql( {
			type: REMOVE_FIELD,
			path: 'testField',
		} );
	} );

	it( '#addArrayFieldItem()', () => {
		const path = 'boxes';
		const item = {
			name: 'Test Envelope',
			type: 'letter',
			dimensions: '14 x 7 x .25',
		};

		const action = addArrayFieldItem( path, item );

		expect( action ).to.eql( {
			type: ADD_ARRAY_FIELD_ITEM,
			path,
			item,
		} );
	} );
} );
