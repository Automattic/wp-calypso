/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { checkoutTheme } from '@automattic/composite-checkout';
import { Plans } from '@automattic/data-stores';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import SecondaryCartPromotions from '../secondary-cart-promotions';
import { responseCartWithRenewal, storeData } from './lib/fixtures';

const mockConfig = config as unknown as { isEnabled: jest.Mock };
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

jest.mock( '@automattic/data-stores', () => {
	return {
		...jest.requireActual( '@automattic/data-stores' ),
		Plans: {
			...jest.requireActual( '@automattic/data-stores' ).Plans,
			usePlans: jest.fn(),
			useSitePlans: jest.fn(),
		},
	};
} );

describe( 'SecondaryCartPromotions', () => {
	const store = applyMiddleware( thunk )( createStore )( storeData );

	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	beforeEach( () => {
		jest.clearAllMocks();
		Plans.usePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {},
		} ) );
		Plans.useSitePlans.mockImplementation( () => ( {
			isLoading: false,
			data: {
				[ PLAN_PERSONAL ]: {
					expiry: null,
					pricing: {
						billPeriod: 365,
						currencyCode: 'USD',
						originalPrice: {
							full: 500,
							monthly: 500,
						},
						discountedPrice: {
							full: 250,
							monthly: 250,
						},
					},
				},
			},
		} ) );
	} );

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
			test( 'displays the upcoming renewals reminder', () => {
				const { queryByText } = render(
					<ReduxProvider store={ store }>
						<ThemeProvider theme={ checkoutTheme }>
							<SecondaryCartPromotions
								responseCart={ responseCartWithRenewal }
								addItemToCart={ jest.fn() }
								isPurchaseRenewal={ true }
							/>
						</ThemeProvider>
					</ReduxProvider>,
					{ wrapper: Wrapper }
				);
				expect( queryByText( 'Renew your products together' ) ).toBeTruthy();
				expect( queryByText( 'Renew all' ) ).toBeTruthy();
			} );

			test( 'does not crash when there is missing data', () => {
				const { container } = render(
					<ReduxProvider store={ store }>
						<ThemeProvider theme={ checkoutTheme }>
							<SecondaryCartPromotions responseCart={ null } addItemToCart={ jest.fn() } />
						</ThemeProvider>
					</ReduxProvider>,
					{ wrapper: Wrapper }
				);
				expect( container ).toHaveTextContent( '' );
			} );

			test( 'adds the items to the cart when "Renew all" is clicked', async () => {
				const mockAddItemToCart = jest.fn();
				const { queryByText } = render(
					<ReduxProvider store={ store }>
						<ThemeProvider theme={ checkoutTheme }>
							<SecondaryCartPromotions
								responseCart={ responseCartWithRenewal }
								addItemToCart={ mockAddItemToCart }
								isPurchaseRenewal={ true }
							/>
						</ThemeProvider>
					</ReduxProvider>,
					{ wrapper: Wrapper }
				);
				await userEvent.click( queryByText( 'Renew all' ) );
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
			test( 'does not display the upcoming renewals reminder', () => {
				const { queryByText } = render(
					<ReduxProvider store={ store }>
						<ThemeProvider theme={ checkoutTheme }>
							<SecondaryCartPromotions
								responseCart={ responseCartWithRenewal }
								addItemToCart={ jest.fn() }
							/>
						</ThemeProvider>
					</ReduxProvider>,
					{ wrapper: Wrapper }
				);
				expect( queryByText( 'Renew your products together' ) ).toBeNull();
			} );
		} );
	} );

	describe( 'CartFreeUserPlanUpsell', () => {
		describe( 'when there is a domain in the cart for a site without a paid plan', () => {
			test( 'displays the free user plan upsell component', () => {
				const { queryByText } = render(
					<ReduxProvider store={ store }>
						<ThemeProvider theme={ checkoutTheme }>
							<SecondaryCartPromotions
								responseCart={ responseCartWithRenewal }
								addItemToCart={ jest.fn() }
							/>
						</ThemeProvider>
					</ReduxProvider>,
					{ wrapper: Wrapper }
				);
				expect( queryByText( 'Upgrade and save' ) ).toBeTruthy();
				expect( queryByText( 'Add to Cart' ) ).toBeTruthy();
			} );

			test( 'adds the plan to the cart when "Add to Cart" is clicked', async () => {
				const mockAddItemToCart = jest.fn();
				const { queryByText } = render(
					<ReduxProvider store={ store }>
						<ThemeProvider theme={ checkoutTheme }>
							<SecondaryCartPromotions
								responseCart={ responseCartWithRenewal }
								addItemToCart={ mockAddItemToCart }
							/>
						</ThemeProvider>
					</ReduxProvider>,
					{ wrapper: Wrapper }
				);
				await userEvent.click( queryByText( 'Add to Cart' ) );
				expect( mockAddItemToCart ).toHaveBeenCalledTimes( 1 );
				expect( mockAddItemToCart ).toHaveBeenCalledWith( {
					product_slug: 'personal-bundle',
				} );
			} );
		} );
	} );
} );
