/**
 * External dependencies
 */
import { expect } from 'chai';
import values from 'lodash/values';
import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';

/**
 * Internal dependencies
 */
import { validateAllFields } from '../';

describe( 'index', () => {
	describe( '#validateAllFields', () => {
		it( 'should return no errors for a valid A record', () => {
			const initialData = {
				type: 'A',
				name: 'example.foo.com',
				data: '123.45.78.9'
			};

			const errors = validateAllFields( initialData );

			expect( every( values( errors ), isEmpty ) ).to.be.true;
		} );
	} );
} );
