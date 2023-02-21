/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
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
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { FC } from 'react';

const mockConfig = config as unknown as { isEnabled: jest.Mock };
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

const identity = ( x: string ) => x;

const productMap = [
	[ 'Akismet Anti-spam', 'monthly', PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ],
	[ 'Akismet Anti-spam', 'yearly', PRODUCT_JETPACK_ANTI_SPAM ],
	[ 'VaultPress Backup T1', 'monthly', PRODUCT_JETPACK_BACKUP_T1_MONTHLY ],
	[ 'VaultPress Backup T1', 'yearly', PRODUCT_JETPACK_BACKUP_T1_YEARLY ],
	[ 'Boost', 'yearly', PRODUCT_JETPACK_BOOST_MONTHLY ],
	[ 'Boost', 'monthly', PRODUCT_JETPACK_BOOST ],
	[ 'Complete', 'monthly', PLAN_JETPACK_COMPLETE_MONTHLY ],
	[ 'Complete', 'yearly', PLAN_JETPACK_COMPLETE ],
	[ 'Scan', 'monthly', PRODUCT_JETPACK_SCAN_MONTHLY ],
	[ 'Scan', 'yearly', PRODUCT_JETPACK_SCAN ],
	[ 'Search', 'monthly', PRODUCT_JETPACK_SEARCH_MONTHLY ],
	[ 'Search', 'yearly', PRODUCT_JETPACK_SEARCH ],
	[ 'Security T1', 'monthly', PLAN_JETPACK_SECURITY_T1_MONTHLY ],
	[ 'Security T1', 'yearly', PLAN_JETPACK_SECURITY_T1_YEARLY ],
	[ 'Social Basic', 'monthly', PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ],
	[ 'Social Basic', 'yearly', PRODUCT_JETPACK_SOCIAL_BASIC ],
	[ 'Social Advanced', 'monthly', PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ],
	[ 'Social Advanced', 'yearly', PRODUCT_JETPACK_SOCIAL_ADVANCED ],
	[ 'VideoPress', 'monthly', PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ],
	[ 'VideoPress', 'yearly', PRODUCT_JETPACK_VIDEOPRESS ],
];

const nonFeatureListProductMap = [
	[ 'Backup T2', 'monthly', PRODUCT_JETPACK_BACKUP_T2_MONTHLY ],
	[ 'Backup T2', 'yearly', PRODUCT_JETPACK_BACKUP_T2_YEARLY ],
	[ 'Security T2', 'monthly', PLAN_JETPACK_SECURITY_T2_MONTHLY ],
	[ 'Security T2', 'yearly', PLAN_JETPACK_SECURITY_T2_YEARLY ],
];

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
		// Loop through adding all products to cart, and ensuring their respective feature lists are shown
		productMap.forEach( ( product ) => {
			const [ productName, billingTerm, productSlug ] = product;

			test( `${ productName } feature list shows up if ${ productName } ${ billingTerm } is in the cart`, async () => {
				const product = convertProductSlugToResponseProduct( productSlug );
				const productFeatures = getJetpackProductFeatures(
					product,
					identity as ReturnType< typeof useTranslate >
				);
				const cartChanges = {
					products: [ product ],
				};

				render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

				await waitFor( () => {
					productFeatures.map( ( feature ) => {
						expect( screen.queryByText( feature ) ).toBeInTheDocument();
					} );
				} );
			} );
		} );

		// Ensure deprecated Security T2 and Backup T2 plans do not show a feature list
		nonFeatureListProductMap.forEach( ( product ) => {
			const [ productName, billingTerm, productSlug ] = product;

			test( `Deprecated T2 plan ${ productName } ${ billingTerm } does not show feature list`, async () => {
				const product = convertProductSlugToResponseProduct( productSlug );
				const productFeatures = getJetpackProductFeatures(
					product,
					identity as ReturnType< typeof useTranslate >
				);

				expect( productFeatures.length ).toEqual( 0 );
			} );
		} );

		test( 'No feature list items show up if there are multiple items in the cart', async () => {
			const allProducts = productMap.reduce(
				( productList: ResponseCartProduct[], currentProduct ) => {
					productList.push( convertProductSlugToResponseProduct( currentProduct[ 2 ] ) );
					return productList;
				},
				[]
			);

			// Converting to Set to remove duplicate strings to avoid unnecessary loops
			const allFeatures = new Set(
				allProducts.reduce( ( featureList: string[], currentProduct ) => {
					const currentProductFeatures = getJetpackProductFeatures(
						currentProduct,
						identity as ReturnType< typeof useTranslate >
					);
					return [ ...featureList, ...currentProductFeatures ];
				}, [] )
			);

			const cartChanges = {
				products: allProducts,
			};

			render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

			await waitFor( async () => {
				allFeatures.forEach( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );

		test( 'No feature list items show up if the cart is empty', async () => {
			const allProducts = productMap.reduce(
				( productList: ResponseCartProduct[], currentProduct ) => {
					productList.push( convertProductSlugToResponseProduct( currentProduct[ 2 ] ) );
					return productList;
				},
				[]
			);

			// Converting to Set to remove duplicate strings to avoid unnecessary loops
			const allFeatures = new Set(
				allProducts.reduce( ( featureList: string[], currentProduct ) => {
					const currentProductFeatures = getJetpackProductFeatures(
						currentProduct,
						identity as ReturnType< typeof useTranslate >
					);
					return [ ...featureList, ...currentProductFeatures ];
				}, [] )
			);

			const cartChanges = { products: [] };

			render( <MyCheckoutSummary cartChanges={ cartChanges } /> );

			await waitFor( async () => {
				allFeatures.forEach( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );
	} );
} );
