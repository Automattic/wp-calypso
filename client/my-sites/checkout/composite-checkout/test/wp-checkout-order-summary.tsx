/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_SCAN,
} from '@automattic/calypso-products';
import { checkoutTheme } from '@automattic/composite-checkout';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { render, screen, waitFor } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import WPCheckoutOrderSummary from '../components/wp-checkout-order-summary';
import getJetpackProductFeatures from '../lib/get-jetpack-product-features';
import {
	mockSetCartEndpointWith,
	mockGetCartEndpointWith,
	createTestReduxStore,
	getBasicCart,
	convertProductSlugToResponseProduct,
} from './util';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { FC } from 'react';

const mockConfig = config as unknown as { isEnabled: jest.Mock };
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

const translate: ( original: string ) => string = ( original ) => {
	return original;
};

describe( 'WPCheckoutOrderSummary', () => {
	let container: HTMLDivElement | null;
	let MyCheckoutSummary: FC< { cartChanges: Partial< ResponseCart > } >;

	beforeEach( () => {
		jest.clearAllMocks();

		container = document.createElement( 'div' );
		document.body.appendChild( container );

		const store = createTestReduxStore();
		const initialCart = getBasicCart();
		const mockSetCartEndpoint = mockSetCartEndpointWith( {
			currency: initialCart.currency,
			locale: initialCart.locale,
		} );

		MyCheckoutSummary = ( { cartChanges } ) => {
			const managerClient = createShoppingCartManagerClient( {
				getCart: mockGetCartEndpointWith( { ...initialCart, ...( cartChanges ?? {} ) } ),
				setCart: mockSetCartEndpoint,
			} );

			return (
				<ReduxProvider store={ store }>
					<ThemeProvider theme={ checkoutTheme }>
						<ShoppingCartProvider
							managerClient={ managerClient }
							options={ {
								defaultCartKey: 123456,
							} }
						>
							<WPCheckoutOrderSummary siteId={ undefined } onChangePlanLength={ () => null } />
						</ShoppingCartProvider>
					</ThemeProvider>
				</ReduxProvider>
			);
		};
	} );

	afterEach( () => {
		document.body.removeChild( container as HTMLDivElement );
		container = null;
		mockConfig.isEnabled.mockRestore();
	} );

	describe( 'CheckoutSummaryJetpackProductFeatures', () => {
		test( 'VaultPress Backup T1 related feature list is visible when VaultPress Backup T1 monthly is in cart', async () => {
			const backupT1Monthly = convertProductSlugToResponseProduct(
				PRODUCT_JETPACK_BACKUP_T1_MONTHLY
			);
			const productFeatures = getJetpackProductFeatures(
				backupT1Monthly,
				translate as ReturnType< typeof useTranslate >
			);
			const cartChanges = {
				products: [ backupT1Monthly ],
			};

			render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

			await waitFor( async () => {
				productFeatures.map( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeInTheDocument();
				} );
			} );
		} );

		test( 'VaultPress Backup T1 related feature list is visible when VaultPress Backup T1 yearly is in cart', async () => {
			const backupT1Yearly = convertProductSlugToResponseProduct(
				PRODUCT_JETPACK_BACKUP_T1_YEARLY
			);
			const productFeatures = getJetpackProductFeatures(
				backupT1Yearly,
				translate as ReturnType< typeof useTranslate >
			);
			const cartChanges = {
				products: [ backupT1Yearly ],
			};

			render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

			await waitFor( async () => {
				productFeatures.map( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeInTheDocument();
				} );
			} );
		} );

		test( 'VaultPress Backup T1 related feature list does not show up if there are multiple items in the cart', async () => {
			const backupT1Yearly = convertProductSlugToResponseProduct(
				PRODUCT_JETPACK_BACKUP_T1_YEARLY
			);
			const productFeatures = getJetpackProductFeatures(
				backupT1Yearly,
				translate as ReturnType< typeof useTranslate >
			);
			const scan = convertProductSlugToResponseProduct( PRODUCT_JETPACK_SCAN );

			const cartChanges = {
				products: [ backupT1Yearly, scan ],
			};

			render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

			await waitFor( async () => {
				productFeatures.map( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );

		test( 'VaultPress Backup T1 related feature list does not show up if the cart is empty', async () => {
			const backupT1Yearly = convertProductSlugToResponseProduct(
				PRODUCT_JETPACK_BACKUP_T1_YEARLY
			);
			const productFeatures = getJetpackProductFeatures(
				backupT1Yearly,
				translate as ReturnType< typeof useTranslate >
			);
			const cartChanges = { products: [] };

			render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

			await waitFor( async () => {
				productFeatures.map( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );

		test( 'VaultPress Backup T1 related feature list does not show up if a different Jetpack product is in cart', async () => {
			const scan = convertProductSlugToResponseProduct( PRODUCT_JETPACK_SCAN );
			const backupT1Yearly = convertProductSlugToResponseProduct(
				PRODUCT_JETPACK_BACKUP_T1_YEARLY
			);
			const productFeatures = getJetpackProductFeatures(
				backupT1Yearly,
				translate as ReturnType< typeof useTranslate >
			);
			const cartChanges = { products: [ scan ] };

			render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

			await waitFor( async () => {
				productFeatures.map( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );
	} );
} );
