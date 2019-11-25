/**
 * External dependencies
 */
import { every, isEmpty, values } from 'lodash';

/**
 * Internal dependencies
 */
import { validateAllFields } from '../utils';

describe( 'utils', () => {
	describe( '#validateAllFields', () => {
		test( 'should return no errors for a valid A record', () => {
			const initialData = {
				type: 'A',
				name: 'example.foo.com',
				data: '123.45.78.9',
			};

			const errors = validateAllFields( initialData );

			expect( every( values( errors ), isEmpty ) ).toBe( true );
		} );
	} );
} );
