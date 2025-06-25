/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import config from '@automattic/calypso-config';
import { checkoutTheme } from '@automattic/composite-checkout';
import { RawAPIProductsList, StoreProductSlug } from '@automattic/data-stores/src/products-list';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { WpcomRequestParams } from 'wpcom-proxy-request';
import {
	mockGetCartEndpointWith,
	mockSetCartEndpointWith,
} from 'calypso/my-sites/checkout/src/test/util';
import SecondaryCartPromotions from '../secondary-cart-promotions';
import { responseCartWithRenewal, storeData } from './lib/fixtures';

const mockConfig = config as unknown as { isEnabled: jest.Mock };
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

const mockProductsEndpointResponse: RawAPIProductsList = {
	'personal-bundle': {
		available: true,
		combined_cost_display: '10',
		cost: 10,
		cost_smallest_unit: 1000,
		currency_code: 'USD',
		description: 'Personal',
		is_domain_registration: false,
		price_tier_list: [],
		price_tier_slug: '',
		price_tier_usage_quantity: null,
		price_tiers: '',
		product_id: 1234,
		product_name: 'Personal',
		product_slug: 'personal-bundle' as StoreProductSlug,
		product_type: 'something',
	},
};

// The useProducts hook is in an external package that uses
// `wpcom-proxy-request` directly to fetch data, so using `nock` will not be
// able to mock its request. Instead we have to mock the module directly.
jest.mock( 'wpcom-proxy-request', () => async ( data: WpcomRequestParams ) => {
	switch ( data.path ) {
		case '/products':
			return mockProductsEndpointResponse;
	}
} );

function TestWrapper( { children, initialCart } ) {
	const [ reduxStore ] = useState( () => applyMiddleware( thunk )( createStore )( storeData ) );
	const [ queryClient ] = useState( () => new QueryClient() );
	const mockSetCartEndpoint = mockSetCartEndpointWith( {
		currency: initialCart.currency,
		locale: initialCart.locale,
	} );
	const managerClient = createShoppingCartManagerClient( {
		getCart: mockGetCartEndpointWith( initialCart ),
		setCart: mockSetCartEndpoint,
	} );
	return (
		<ReduxProvider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<ShoppingCartProvider managerClient={ managerClient }>
					<ThemeProvider theme={ checkoutTheme }>{ children }</ThemeProvider>
				</ShoppingCartProvider>
			</QueryClientProvider>
		</ReduxProvider>
	);
}

describe( 'SecondaryCartPromotions', () => {
	afterEach( () => {
		mockConfig.isEnabled.mockRestore();
	} );

	describe( 'UpcomingRenewalsReminder', () => {
		describe( 'when there is a renewal in the cart and the feature flag is enabled', () => {
			beforeEach( () => {
				mockConfig.isEnabled.mockImplementation(
					( flag ) => flag === 'upgrades/upcoming-renewals-notices'
				);
			} );

			test( 'displays the upcoming renewals reminder', async () => {
				render(
					<TestWrapper initialCart={ responseCartWithRenewal }>
						<SecondaryCartPromotions
							responseCart={ responseCartWithRenewal }
							addItemToCart={ jest.fn() }
							isPurchaseRenewal
						/>
					</TestWrapper>
				);
				expect( await screen.findByText( 'Renew your products together' ) ).toBeInTheDocument();
				expect( await screen.findByText( 'Renew all' ) ).toBeInTheDocument();
			} );

			test( 'adds the items to the cart when "Renew all" is clicked', async () => {
				const mockAddItemToCart = jest.fn();
				render(
					<TestWrapper initialCart={ responseCartWithRenewal }>
						<SecondaryCartPromotions
							responseCart={ responseCartWithRenewal }
							addItemToCart={ mockAddItemToCart }
							isPurchaseRenewal
						/>
					</TestWrapper>
				);
				await userEvent.click( await screen.findByText( 'Renew all' ) );
				expect( mockAddItemToCart ).toHaveBeenCalledTimes( 2 );
				expect( mockAddItemToCart ).toHaveBeenCalledWith(
					expect.objectContaining( {
						product_slug: 'personal-bundle',
						extra: expect.objectContaining( { purchaseId: 1 } ),
					} )
				);
				expect( mockAddItemToCart ).toHaveBeenCalledWith(
					expect.objectContaining( {
						product_slug: 'dotlive_domain',
						extra: expect.objectContaining( { purchaseId: 2 } ),
					} )
				);
			} );
		} );

		describe( 'when there is a renewal in the cart and the feature flag is disabled', () => {
			test( 'does not display the upcoming renewals reminder', async () => {
				render(
					<TestWrapper initialCart={ responseCartWithRenewal }>
						<SecondaryCartPromotions
							responseCart={ responseCartWithRenewal }
							addItemToCart={ jest.fn() }
						/>
					</TestWrapper>
				);
				await expect( screen.findByText( 'Renew your products together' ) ).toNeverAppear();
			} );
		} );
	} );

	describe( 'CartFreeUserPlanUpsell', () => {
		describe( 'when there is a domain in the cart for a site without a paid plan', () => {
			test( 'displays the free user plan upsell component', async () => {
				render(
					<TestWrapper initialCart={ responseCartWithRenewal }>
						<SecondaryCartPromotions
							responseCart={ responseCartWithRenewal }
							addItemToCart={ jest.fn() }
						/>
					</TestWrapper>
				);
				expect( await screen.findByText( 'Upgrade and save' ) ).toBeInTheDocument();
				expect( await screen.findByText( 'Add to Cart' ) ).toBeInTheDocument();
			} );

			test( 'adds the plan to the cart when "Add to Cart" is clicked', async () => {
				const mockAddItemToCart = jest.fn();
				render(
					<TestWrapper initialCart={ responseCartWithRenewal }>
						<SecondaryCartPromotions
							responseCart={ responseCartWithRenewal }
							addItemToCart={ mockAddItemToCart }
						/>
					</TestWrapper>
				);
				await userEvent.click( await screen.findByText( 'Add to Cart' ) );
				expect( mockAddItemToCart ).toHaveBeenCalledTimes( 1 );
				expect( mockAddItemToCart ).toHaveBeenCalledWith( {
					product_slug: 'personal-bundle',
				} );
			} );
		} );
	} );
} );
