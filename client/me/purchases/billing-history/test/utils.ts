import deepFreeze from 'deep-freeze';
import { groupDomainProducts } from '../utils';

const ident = ( x ) => x;

describe( 'utils', () => {
	describe( '#groupDomainProducts()', () => {
		test( 'should return non-domain items unchanged', () => {
			const items = deepFreeze( [ { foo: 'bar', product_slug: 'foobar' } ] );
			const result = groupDomainProducts( items, ident );
			expect( result ).toEqual( items );
		} );

		test( 'should return a single domain item unchanged', () => {
			const items = deepFreeze( [
				{ foo: 'bar', product_slug: 'foobar' },
				{ product_slug: 'wp-domains', domain: 'foo.com', variation_slug: 'none' },
			] );
			const expected = [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					product_slug: 'wp-domains',
					variation_slug: 'none',
					domain: 'foo.com',
				},
			];
			const result = groupDomainProducts( items, ident );
			expect( result ).toEqual( expected );
		} );

		test( 'should not group domain items with different domains', () => {
			const items = deepFreeze( [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					id: '2',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					cost_overrides: [],
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'bar.com',
					variation_slug: 'wp-private-registration',
					cost_overrides: [],
				},
			] );
			const expected = [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					id: '2',
					product_slug: 'wp-domains',
					variation_slug: 'wp-private-registration',
					domain: 'foo.com',
					cost_overrides: [],
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					variation_slug: 'wp-private-registration',
					domain: 'bar.com',
					cost_overrides: [],
				},
			];
			const result = groupDomainProducts( items, ident );
			expect( result ).toEqual( expected );
			expect( result.length ).toEqual( 3 );
		} );

		test( 'should only return one domain item of multiple with the same domain', () => {
			const items = deepFreeze( [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					id: '2',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					cost_overrides: [],
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					cost_overrides: [],
				},
			] );
			const result = groupDomainProducts( items, ident );
			expect( result.length ).toEqual( 2 );
		} );

		test( 'should sum the prices for multiple items with the same domain', () => {
			const items = deepFreeze( [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					id: '1',
					product_slug: 'wp-domains',
					domain: 'bar.com',
					variation_slug: 'none',
					currency: 'USD',
					raw_amount: 2,
					amount_integer: 200,
					subtotal_integer: 210,
					tax_integer: 10,
					cost_overrides: [],
				},
				{
					id: '2',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'none',
					currency: 'USD',
					raw_amount: 3,
					amount_integer: 300,
					subtotal_integer: 310,
					tax_integer: 10,
					cost_overrides: [],
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					currency: 'USD',
					raw_amount: 7,
					amount_integer: 700,
					subtotal_integer: 711,
					tax_integer: 11,
					cost_overrides: [],
				},
				{
					id: '4',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					currency: 'USD',
					raw_amount: 9,
					amount_integer: 900,
					subtotal_integer: 912,
					tax_integer: 12,
					cost_overrides: [],
				},
			] );
			const result = groupDomainProducts( items, ident );
			expect( result[ 1 ].raw_amount ).toEqual( 2 );
			expect( result[ 1 ].amount_integer ).toEqual( 200 );
			expect( result[ 1 ].subtotal_integer ).toEqual( 210 );
			expect( result[ 1 ].tax_integer ).toEqual( 10 );
			expect( result[ 2 ].raw_amount ).toEqual( 19 );
			expect( result[ 2 ].amount_integer ).toEqual( 1900 );
			expect( result[ 2 ].subtotal_integer ).toEqual( 1933 );
			expect( result[ 2 ].tax_integer ).toEqual( 33 );
		} );

		test( 'should include the formatted, summed raw_amount as amount for multiple items with the same domain', () => {
			const items = deepFreeze( [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					id: '1',
					product_slug: 'wp-domains',
					domain: 'bar.com',
					variation_slug: 'none',
					amount: '$2.00',
					currency: 'USD',
					raw_amount: 2,
					amount_integer: 200,
					cost_overrides: [],
				},
				{
					id: '2',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'none',
					amount: '$3.00',
					currency: 'USD',
					raw_amount: 3,
					amount_integer: 300,
					cost_overrides: [],
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					amount: '$7.00',
					currency: 'USD',
					raw_amount: 7,
					amount_integer: 700,
					cost_overrides: [],
				},
				{
					id: '4',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					amount: '$9.00',
					currency: 'USD',
					raw_amount: 9,
					amount_integer: 900,
					cost_overrides: [],
				},
			] );
			const result = groupDomainProducts( items, ident );
			expect( result[ 1 ].amount ).toEqual( '$2.00' );
			expect( result[ 1 ].amount_integer ).toEqual( 200 );
			expect( result[ 2 ].amount ).toEqual( '$19' );
			expect( result[ 2 ].amount_integer ).toEqual( 1900 );
		} );
	} );
} );
