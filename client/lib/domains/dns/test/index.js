/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { every, isEmpty, values } from 'lodash';

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
				data: '123.45.78.9',
			};

			const errors = validateAllFields( initialData );

			expect( every( values( errors ), isEmpty ) ).to.be.true;
		} );
	} );
} );
