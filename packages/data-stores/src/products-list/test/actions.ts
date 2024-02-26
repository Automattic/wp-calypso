import { requestProductsList, receiveProductsListFailure, receiveProductsList } from '../actions';
import { RawAPIProductsList } from '../types';

describe( 'actions', () => {
	it( 'should return a PRODUCTS_LIST_REQUEST action', () => {
		const expected = {
			type: 'PRODUCTS_LIST_REQUEST',
		};

		expect( requestProductsList() ).toEqual( expected );
	} );

	it( 'should return a PRODUCTS_LIST_REQUEST_FAILURE action', () => {
		const error = {
			message: 'test error',
		};

		const expected = {
			type: 'PRODUCTS_LIST_REQUEST_FAILURE',
			error,
		};

		expect( receiveProductsListFailure( error ) ).toEqual( expected );
	} );

	it( 'should return a PRODUCTS_LIST_RECEIVE action', () => {
		const productsList = {
			test_product: {
				available: true,
				combined_cost_display: '$20.00',
				cost: 20,
				cost_smallest_unit: 2000,
				cost_display: '$20.00',
				currency_code: 'USD',
				description: 'test product',
				is_domain_registration: false,
				price_tier_list: [],
				price_tier_slug: '',
				price_tier_usage_quantity: null,
				price_tiers: [],
				product_id: 9,
				product_name: '10GB',
				product_slug: '1gb_space_upgrade',
				product_term: 'year',
				product_type: 'space',
			},
		} as RawAPIProductsList;

		const expected = {
			type: 'PRODUCTS_LIST_RECEIVE',
			productsList,
		};

		expect( receiveProductsList( productsList ) ).toEqual( expected );
	} );
} );
