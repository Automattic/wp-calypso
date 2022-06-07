/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { checkoutTheme } from '@automattic/composite-checkout';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe( 'SecondaryCartPromotions', () => {
	const store = applyMiddleware( thunk )( createStore )( storeData );

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
							/>
						</ThemeProvider>
					</ReduxProvider>
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
					</ReduxProvider>
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
							/>
						</ThemeProvider>
					</ReduxProvider>
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
					</ReduxProvider>
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
					</ReduxProvider>
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
					</ReduxProvider>
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
