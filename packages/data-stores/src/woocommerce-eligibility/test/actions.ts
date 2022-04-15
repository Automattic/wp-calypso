import { createActions } from '../actions';
import {
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
	PRODUCTS_LIST_RECEIVE,
} from '../constants';
import { ProductsList } from '../types';

describe( 'actions', () => {
	it( 'should return a PRODUCTS_LIST_REQUEST action', () => {
		const { requestProductsList } = createActions();

		const expected = {
			type: PRODUCTS_LIST_REQUEST,
		};

		expect( requestProductsList() ).toEqual( expected );
	} );

	it( 'should return a PRODUCTS_LIST_REQUEST_FAILURE action', () => {
		const { receiveProducstListFailure } = createActions();
		const error = {
			message: 'test error',
		};

		const expected = {
			type: PRODUCTS_LIST_REQUEST_FAILURE,
			error,
		};

		expect( receiveProducstListFailure( error ) ).toEqual( expected );
	} );

	it( 'should return a PRODUCTS_LIST_RECEIVE action', () => {
		const { receiveProductsList } = createActions();

		const productsList = {
			test_product: {
				available: true,
				combined_cost_display: '$20.00',
				cost: 20,
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
		} as ProductsList;
		const productsListType = 'jetpack';

		const expected = {
			type: PRODUCTS_LIST_RECEIVE,
			productsList,
			productsListType,
		};

		expect( receiveProductsList( productsList, productsListType ) ).toEqual( expected );
	} );
} );
