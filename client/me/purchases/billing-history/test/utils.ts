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
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'bar.com',
					variation_slug: 'wp-private-registration',
				},
			] );
			const expected = [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					id: '2',
					product_slug: 'wp-domains',
					variation_slug: 'wp-private-registration',
					domain: 'foo.com',
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					variation_slug: 'wp-private-registration',
					domain: 'bar.com',
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
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
				},
			] );
			const result = groupDomainProducts( items, ident );
			expect( result.length ).toEqual( 2 );
		} );

		test( 'should sum the raw_amount for multiple items with the same domain', () => {
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
				},
				{
					id: '2',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'none',
					currency: 'USD',
					raw_amount: 3,
					amount_integer: 300,
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					currency: 'USD',
					raw_amount: 7,
					amount_integer: 700,
				},
				{
					id: '4',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					currency: 'USD',
					raw_amount: 9,
					amount_integer: 900,
				},
			] );
			const result = groupDomainProducts( items, ident );
			expect( result[ 1 ].raw_amount ).toEqual( 2 );
			expect( result[ 1 ].amount_integer ).toEqual( 200 );
			expect( result[ 2 ].raw_amount ).toEqual( 19 );
			expect( result[ 2 ].amount_integer ).toEqual( 1900 );
		} );

		test( 'should include the formatted, summed raw_amount as amount for multiple items with teh same domain', () => {
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
