/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	updateField,
	UPDATE_FIELD,
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
} );
