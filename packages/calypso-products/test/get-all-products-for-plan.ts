import { getAllProductsForPlan } from '../src';

describe( 'getAllProductsForPlan', () => {
	test( 'returns an empty array when given an invalid plan', () => {
		const result = getAllProductsForPlan( 'invalid-plan' );
		expect( result ).toEqual( [] );
	} );

	test( 'returns an array of products included in the plan', () => {
		const plan = {
			id: 'basic-plan',
			name: 'Basic Plan',
			getProductsIncluded: () => [
				{ id: 'product-1', name: 'Product 1' },
				{ id: 'product-2', name: 'Product 2' },
			],
		};
		const result = getAllProductsForPlan( plan );
		expect( result ).toEqual( [
			{ id: 'product-1', name: 'Product 1' },
			{ id: 'product-2', name: 'Product 2' },
		] );
	} );

	test( 'returns an empty array when the plan has no products included', () => {
		const plan = {
			id: 'free-plan',
			name: 'Free Plan',
		};
		const result = getAllProductsForPlan( plan );
		expect( result ).toEqual( [] );
	} );
} );
