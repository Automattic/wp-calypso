/**
 * Internal dependencies
 */
import { isItemValid } from '../validation';
import type { Field } from '../types';

describe( 'validation', () => {
	it( 'fields not visible in form are not validated', () => {
		const item = { id: 1, valid_order: 2, invalid_order: 'd' };
		const fields: Field< {} >[] = [
			{
				id: 'valid_order',
				type: 'integer',
			},
			{
				id: 'invalid_order',
				type: 'integer',
			},
		];
		const form = { fields: [ 'valid_order' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( true );
	} );

	it( 'integer field is valid if value is integer', () => {
		const item = { id: 1, order: 2, title: 'hi' };
		const fields: Field< {} >[] = [
			{
				type: 'integer',
				id: 'order',
			},
		];
		const form = { fields: [ 'order' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( true );
	} );

	it( 'integer field is invalid if value is not integer', () => {
		const item = { id: 1, order: 'd' };
		const fields: Field< {} >[] = [
			{
				id: 'order',
				type: 'integer',
			},
		];
		const form = { fields: [ 'order' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( false );
	} );

	it( 'integer field is invalid if value is empty', () => {
		const item = { id: 1, order: '' };
		const fields: Field< {} >[] = [
			{
				id: 'order',
				type: 'integer',
			},
		];
		const form = { fields: [ 'order' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( false );
	} );

	it( 'integer field is invalid if value is not one of the elements', () => {
		const item = { id: 1, author: 3 };
		const fields: Field< {} >[] = [
			{
				id: 'author',
				type: 'integer',
				elements: [
					{ value: 1, label: 'Jane' },
					{ value: 2, label: 'John' },
				],
			},
		];
		const form = { fields: [ 'author' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( false );
	} );

	it( 'text field is invalid if value is not one of the elements', () => {
		const item = { id: 1, author: 'not-in-elements' };
		const fields: Field< {} >[] = [
			{
				id: 'author',
				type: 'text',
				elements: [
					{ value: 'jane', label: 'Jane' },
					{ value: 'john', label: 'John' },
				],
			},
		];
		const form = { fields: [ 'author' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( false );
	} );

	it( 'untyped field is invalid if value is not one of the elements', () => {
		const item = { id: 1, author: 'not-in-elements' };
		const fields: Field< {} >[] = [
			{
				id: 'author',
				elements: [
					{ value: 'jane', label: 'Jane' },
					{ value: 'john', label: 'John' },
				],
			},
		];
		const form = { fields: [ 'author' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( false );
	} );

	it( 'fields can provide its own isValid function', () => {
		const item = { id: 1, order: 'd' };
		const fields: Field< {} >[] = [
			{
				id: 'order',
				type: 'integer',
				elements: [
					{ value: 'a', label: 'A' },
					{ value: 'b', label: 'B' },
				],
				isValid: () => true, // Overrides the validation provided for integer types.
			},
		];
		const form = { fields: [ 'order' ] };
		const result = isItemValid( item, fields, form );
		expect( result ).toBe( true );
	} );
} );
