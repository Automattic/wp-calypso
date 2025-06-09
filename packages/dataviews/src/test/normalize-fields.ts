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
	describe( 'filterBy', () => {
		it( 'returns the default field type definition if undefined for untyped field', () => {
			const fields: Field< {} >[] = [
				{
					id: 'user',
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].filterBy;
			expect( result ).toBe( false );
		} );

		it( 'returns the field type definition for typed fields', () => {
			const fields: Field< {} >[] = [
				{
					id: 'user',
					type: 'integer',
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].filterBy;
			expect( result ).toStrictEqual( {
				operators: [
					'is',
					'isNot',
					'lessThan',
					'greaterThan',
					'lessThanOrEqual',
					'greaterThanOrEqual',
				],
			} );
		} );

		it( 'returns false if is false', () => {
			const fields: Field< {} >[] = [
				{
					id: 'user',
					filterBy: false,
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].filterBy;
			expect( result ).toBe( false );
		} );

		it( 'returns the config if it provides one', () => {
			const fields: Field< {} >[] = [
				{
					id: 'user',
					filterBy: {
						isPrimary: true,
						operators: [ 'is', 'isNot' ],
					},
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].filterBy;
			expect( result ).toStrictEqual( {
				isPrimary: true,
				operators: [ 'is', 'isNot' ],
			} );
		} );

		it( 'returns false if the none of the operators are valid for the type', () => {
			const fields: Field< {} >[] = [
				{
					id: 'user',
					filterBy: {
						// @ts-ignore
						operators: [ 'invalid', 'operator' ],
					},
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].filterBy;
			expect( result ).toBe( false );
		} );

		it( 'returns false if the list of operators is empty', () => {
			const fields: Field< {} >[] = [
				{
					id: 'user',
					filterBy: {
						operators: [],
					},
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].filterBy;
			expect( result ).toBe( false );
		} );

		it( 'removes invalid operators for the type', () => {
			const fields: Field< {} >[] = [
				{
					id: 'user',
					type: 'integer',
					filterBy: {
						isPrimary: true,
						// @ts-ignore
						operators: [ 'invalid', 'lessThan' ],
					},
				},
			];
			const normalizedFields = normalizeFields( fields );
			const result = normalizedFields[ 0 ].filterBy;
			expect( result ).toStrictEqual( {
				isPrimary: true,
				operators: [ 'lessThan' ],
			} );
		} );
	} );
} );
