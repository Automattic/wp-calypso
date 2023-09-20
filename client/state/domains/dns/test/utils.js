import { isEmpty } from 'lodash';
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

			expect( Object.values( errors ).every( isEmpty ) ).toBe( true );
		} );

		test( 'should return no errors for a valid CNAME record (with trailing dot and length 254)', () => {
			const initialData = {
				type: 'CNAME',
				name: 'example.foo.com',
				data: 'abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1.com.',
			};

			const errors = validateAllFields( initialData );

			expect( Object.values( errors ).every( isEmpty ) ).toBe( true );
		} );

		test( 'should return no error for a valid CNAME record (no trailing dot and length 253)', () => {
			const initialData = {
				type: 'CNAME',
				name: 'example.foo.com',
				data: 'abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1.com',
			};

			const errors = validateAllFields( initialData );

			expect( Object.values( errors ).every( isEmpty ) ).toBe( true );
		} );

		test( 'should return errors for a invalid CNAME record (with trailing dot and length 255)', () => {
			const initialData = {
				type: 'CNAME',
				name: 'example.foo.com',
				data: 'abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz12.com.',
			};

			const errors = validateAllFields( initialData );

			expect( Object.values( errors ).every( isEmpty ) ).toBe( false );
		} );

		test( 'should return error for a invalid CNAME record (no trailing dot and length 254)', () => {
			const initialData = {
				type: 'CNAME',
				name: 'example.foo.com',
				data: 'abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz1234567890.abcdefghijklmnopqrstuvwxyz12.com',
			};

			const errors = validateAllFields( initialData );

			expect( Object.values( errors ).every( isEmpty ) ).toBe( false );
		} );
	} );
} );
