/**
 * Internal dependencies
 */
import { normalizeFields } from '../normalize-fields';
import type { Field } from '../types';

describe( 'normalizeFields: default getValue', () => {
	describe( 'getValue from ID', () => {
		it( 'user', () => {
			const item = { user: 'value' };
			const fields: Field< {} >[] = [
				{
					id: 'user',
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].getValue( { item } );
			expect( result ).toBe( 'value' );
		} );

		it( 'user.name', () => {
			const item = { user: { name: 'value' } };
			const fields: Field< {} >[] = [
				{
					id: 'user.name',
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].getValue( { item } );
			expect( result ).toBe( 'value' );
		} );

		it( 'user.name.first', () => {
			const item = { user: { name: { first: 'value' } } };
			const fields: Field< {} >[] = [
				{
					id: 'user.name.first',
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].getValue( { item } );
			expect( result ).toBe( 'value' );
		} );
	} );
} );
