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

		test( 'should return a domain item with a groupCount', () => {
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
					groupCount: 1,
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
					groupCount: 1,
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					variation_slug: 'wp-private-registration',
					domain: 'bar.com',
					groupCount: 1,
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

		test( 'should increment groupCount for multiple items with the same domain', () => {
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
			expect( result[ 1 ].groupCount ).toEqual( 2 );
		} );

		test( 'should sum the raw_amount for multiple items with the same domain', () => {
			const items = deepFreeze( [
				{ foo: 'bar', product_slug: 'foobar' },
				{
					id: '1',
					product_slug: 'wp-domains',
					domain: 'bar.com',
					variation_slug: 'none',
					raw_amount: 2,
				},
				{
					id: '2',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'none',
					raw_amount: 3,
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					raw_amount: 7,
				},
				{
					id: '4',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					raw_amount: 9,
				},
			] );
			const result = groupDomainProducts( items, ident );
			expect( result[ 1 ].raw_amount ).toEqual( 2 );
			expect( result[ 2 ].raw_amount ).toEqual( 19 );
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
					raw_amount: 2,
				},
				{
					id: '2',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'none',
					amount: '$3.00',
					raw_amount: 3,
				},
				{
					id: '3',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					amount: '$7.00',
					raw_amount: 7,
				},
				{
					id: '4',
					product_slug: 'wp-domains',
					domain: 'foo.com',
					variation_slug: 'wp-private-registration',
					amount: '$9.00',
					raw_amount: 9,
				},
			] );
			const result = groupDomainProducts( items, ident );
			expect( result[ 1 ].amount ).toEqual( '$2.00' );
			expect( result[ 2 ].amount ).toEqual( '$19.00' );
		} );
	} );
} );
