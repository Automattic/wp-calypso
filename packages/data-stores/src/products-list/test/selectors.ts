/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */
import { select, subscribe } from '@wordpress/data';
import wpcomRequest from 'wpcom-proxy-request';
import { store } from '../';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

beforeEach( () => {
	( wpcomRequest as jest.Mock ).mockReset();
} );

describe( 'selectors', () => {
	it( 'resolves the state via an API call', async () => {
		const apiResponse = {
			free_plan: {
				product_id: 1,
				product_name: 'WordPress.com Free',
				product_slug: 'free_plan',
				description: '',
				product_type: 'bundle',
				available: true,
				is_domain_registration: false,
				cost_display: '$0.00',
				combined_cost_display: '$0.00',
				cost: 0,
				currency_code: 'USD',
				price_tier_list: [],
				price_tier_usage_quantity: null,
				product_term: 'one time',
				price_tiers: [],
				price_tier_slug: '',
			},
		};

		( wpcomRequest as jest.Mock ).mockResolvedValue( apiResponse );

		// First call returns undefined
		expect( select( store ).getProductsList() ).toEqual( undefined );

		await new Promise< void >( ( resolve ) => {
			const unsubscribe = subscribe( () => {
				if ( select( store ).getProductsList() === undefined ) {
					return;
				}

				unsubscribe();
				resolve();
			} );
		} );

		expect( select( store ).getProductsList() ).toEqual( apiResponse );
		expect( select( store ).getProductBySlug( 'free_plan' ) ).toEqual( apiResponse[ 'free_plan' ] );
	} );
} );
