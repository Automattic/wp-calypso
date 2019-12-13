/**
 * Internal dependencies
 */
import { extractProductSlugs, filterByProductSlugs } from '../utils';

describe( 'extractProductSlugs', () => {
	test( 'should retrieve flat list of product slugs from product options of the products', () => {
		const products = [
			{
				id: 'test',
				options: {
					monthly: [ 'monthly_option_1', 'monthly_option_2' ],
					yearly: [ 'yearly_option_1', 'yearly_option_2' ],
				},
			},
		];

		const expected = [
			'monthly_option_1',
			'monthly_option_2',
			'yearly_option_1',
			'yearly_option_2',
		];
		expect( extractProductSlugs( products ) ).toEqual( expected );
	} );

	test( 'should only return unique product slugs out of each product', () => {
		const products = [
			{
				id: 'test',
				options: {
					monthly: [ 'option_1', 'option_2' ],
					yearly: [ 'option_1', 'option_2' ],
				},
			},
		];

		const expected = [ 'option_1', 'option_2' ];
		expect( extractProductSlugs( products ) ).toEqual( expected );
	} );

	test( 'should only return unique product slugs out the entire product set', () => {
		const products = [
			{
				id: 'test1',
				options: {
					monthly: [ 'monthly_option_1', 'monthly_option_2' ],
					yearly: [ 'yearly_option_1', 'yearly_option_2' ],
				},
			},
			{
				id: 'test2',
				options: {
					monthly: [ 'monthly_option_1', 'monthly_option_2' ],
					yearly: [ 'yearly_option_1', 'yearly_option_2' ],
				},
			},
		];

		const expected = [
			'monthly_option_1',
			'monthly_option_2',
			'yearly_option_1',
			'yearly_option_2',
		];
		expect( extractProductSlugs( products ) ).toEqual( expected );
	} );
} );

describe( 'filterByProductSlugs', () => {
	test( 'should retrieve products that match the product slug', () => {
		const product1 = {
			id: 1,
			product_slug: 'monthly_test_1',
		};
		const product2 = {
			id: 2,
			product_slug: 'yearly_test_1',
		};
		const products = {
			monthly_test_1: product1,
			yearly_test_1: product2,
		};

		const slugs = [ 'monthly_test_1' ];
		expect( filterByProductSlugs( products, slugs ) ).toEqual( { monthly_test_1: product1 } );
	} );
} );
