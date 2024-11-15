/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BOOST_BI_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_MONTHLY,
	PLAN_JETPACK_COMPLETE_BI_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_GROWTH_BI_YEARLY,
	PRODUCT_JETPACK_SCAN_BI_YEARLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SEARCH_BI_YEARLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PRODUCT_JETPACK_STATS_FREE,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PRODUCT_AKISMET_FREE,
	PRODUCT_AKISMET_PERSONAL_MONTHLY,
	PRODUCT_AKISMET_PERSONAL_YEARLY,
	PRODUCT_AKISMET_PRO_500_MONTHLY,
	PRODUCT_AKISMET_PRO_500_YEARLY,
	PRODUCT_AKISMET_PRO_500_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_MONTHLY,
	PRODUCT_AKISMET_PLUS_YEARLY,
	PRODUCT_AKISMET_PLUS_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_20K_MONTHLY,
	PRODUCT_AKISMET_PLUS_20K_YEARLY,
	PRODUCT_AKISMET_PLUS_20K_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_30K_MONTHLY,
	PRODUCT_AKISMET_PLUS_30K_YEARLY,
	PRODUCT_AKISMET_PLUS_30K_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_40K_MONTHLY,
	PRODUCT_AKISMET_PLUS_40K_YEARLY,
	PRODUCT_AKISMET_PLUS_40K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_BI_YEARLY,
	PRODUCT_AKISMET_BUSINESS_5K_MONTHLY,
	PRODUCT_AKISMET_BUSINESS_5K_YEARLY,
	PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_15K_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_15K_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_15K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_25K_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_25K_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_25K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_350K_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_350K_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_2M_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_2M_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_GT2M_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_GT2M_YEARLY,
} from '@automattic/calypso-products';
import { checkoutTheme } from '@automattic/composite-checkout';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { WPCheckoutOrderSummary } from '../components/wp-checkout-order-summary';
import getAkismetProductFeatures from '../lib/get-akismet-product-features';
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

type translateType = ReturnType< typeof useTranslate >;

const identity = ( x: string ) => x;

const mockConfig = config as unknown as { isEnabled: jest.Mock };
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

const jetpackProductSlugs = [
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	PRODUCT_JETPACK_BOOST_MONTHLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_BI_YEARLY,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_BI_YEARLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_GROWTH_BI_YEARLY,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_BI_YEARLY,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_BI_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_MONTHLY,
	PRODUCT_JETPACK_SOCIAL_V1_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY,
];

const akismetProductSlugs = [
	PRODUCT_AKISMET_FREE,
	PRODUCT_AKISMET_PERSONAL_MONTHLY,
	PRODUCT_AKISMET_PERSONAL_YEARLY,
	PRODUCT_AKISMET_PRO_500_MONTHLY,
	PRODUCT_AKISMET_PRO_500_YEARLY,
	PRODUCT_AKISMET_PRO_500_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_MONTHLY,
	PRODUCT_AKISMET_PLUS_YEARLY,
	PRODUCT_AKISMET_PLUS_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_20K_MONTHLY,
	PRODUCT_AKISMET_PLUS_20K_YEARLY,
	PRODUCT_AKISMET_PLUS_20K_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_30K_MONTHLY,
	PRODUCT_AKISMET_PLUS_30K_YEARLY,
	PRODUCT_AKISMET_PLUS_30K_BI_YEARLY,
	PRODUCT_AKISMET_PLUS_40K_MONTHLY,
	PRODUCT_AKISMET_PLUS_40K_YEARLY,
	PRODUCT_AKISMET_PLUS_40K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_BI_YEARLY,
	PRODUCT_AKISMET_BUSINESS_5K_MONTHLY,
	PRODUCT_AKISMET_BUSINESS_5K_YEARLY,
	PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_15K_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_15K_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_15K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_25K_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_25K_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_25K_BI_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_350K_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_350K_YEARLY,
	PRODUCT_AKISMET_ENTERPRISE_2M_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_2M_YEARLY,
];

const nonFeatureListAkismetProductSlugs = [
	PRODUCT_AKISMET_ENTERPRISE_GT2M_MONTHLY,
	PRODUCT_AKISMET_ENTERPRISE_GT2M_YEARLY,
];

const nonFeatureListJetpackProductSlugs = [
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
];

const allJetpackProducts = jetpackProductSlugs.map( ( currentProduct ) => {
	return convertProductSlugToResponseProduct( currentProduct );
} );
const allAkismetProducts = akismetProductSlugs.map( ( currentProduct ) => {
	return convertProductSlugToResponseProduct( currentProduct );
} );
const allNonFeatureListJetpackProductsSlugs = nonFeatureListJetpackProductSlugs.map(
	( currentProduct ) => convertProductSlugToResponseProduct( currentProduct )
);
const allNonFeatureListAkismetProductsSlugs = nonFeatureListAkismetProductSlugs.map(
	( currentProduct ) => convertProductSlugToResponseProduct( currentProduct )
);

// Converting to Set to remove duplicate strings to avoid unnecessary loops
const allJetpackFeatures = new Set(
	allJetpackProducts.reduce( ( featureList: string[], currentProduct ) => {
		const currentProductFeatures = getJetpackProductFeatures(
			currentProduct,
			identity as translateType
		);
		return [ ...featureList, ...currentProductFeatures ];
	}, [] )
);

const allAkismetFeatures = new Set(
	allAkismetProducts.reduce( ( featureList: string[], currentProduct ) => {
		const currentProductFeatures = getAkismetProductFeatures(
			currentProduct,
			identity as translateType
		);
		return [ ...featureList, ...currentProductFeatures ];
	}, [] )
);

const queryClient = new QueryClient();

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
							<WPCheckoutOrderSummary
								siteId={ undefined }
								onChangeSelection={ () => null }
								showFeaturesList
							/>
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

	describe( 'CheckoutSummaryAkismetProductFeatures', () => {
		// Loop through adding all akismet products to cart, and ensureing their respective feature lists are shown
		allAkismetProducts.forEach( ( product ) => {
			const { product_name, bill_period, product_slug } = product;

			test( `${ product_name } feature list shows up if ${ product_name } ${ bill_period } is in the cart`, async () => {
				const product = convertProductSlugToResponseProduct( product_slug );
				const productFeatures = getAkismetProductFeatures( product, identity as translateType );
				const cartChanges = {
					products: [ product ],
				};

				render(
					<QueryClientProvider client={ queryClient }>
						<MyCheckoutSummary cartChanges={ cartChanges } />
					</QueryClientProvider>
				);

				await waitFor( () => {
					productFeatures.map( ( feature ) => {
						expect( screen.queryByText( feature ) ).toBeInTheDocument();
					} );
				} );
			} );
		} );

		// Ensure enterprise plans do not render feature list, as they are not allowed in cart
		allNonFeatureListAkismetProductsSlugs.forEach( ( product ) => {
			const { product_name, bill_period, product_slug } = product;

			test( `Akismet Enterprise plan ${ product_name } ${ bill_period } does not show feature list`, async () => {
				const product = convertProductSlugToResponseProduct( product_slug );
				const productFeatures = getAkismetProductFeatures( product, identity as translateType );

				expect( productFeatures.length ).toEqual( 0 );
			} );
		} );

		// eslint-disable-next-line jest/expect-expect
		test( 'No feature list items show up if there are multiple items in the cart', async () => {
			const cartChanges = {
				products: allAkismetProducts,
			};

			render(
				<QueryClientProvider client={ queryClient }>
					<MyCheckoutSummary cartChanges={ cartChanges } />
				</QueryClientProvider>
			);

			await waitFor( () => {
				allAkismetFeatures.forEach( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );

		test( 'No feature list items show up if the cart is empty', async () => {
			const cartChanges = { products: [] };

			render(
				<QueryClientProvider client={ queryClient }>
					<MyCheckoutSummary cartChanges={ cartChanges } />
				</QueryClientProvider>
			);

			await waitFor( async () => {
				allAkismetFeatures.forEach( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );
	} );

	describe( 'CheckoutSummaryJetpackProductFeatures', () => {
		// Loop through adding all jetpack products to cart, and ensuring their respective feature lists are shown
		allJetpackProducts.forEach( ( product ) => {
			const { product_name, bill_period, product_slug } = product;

			test( `${ product_name } feature list shows up if ${ product_name } ${ bill_period } is in the cart`, async () => {
				const product = convertProductSlugToResponseProduct( product_slug );
				const productFeatures = getJetpackProductFeatures( product, identity as translateType );
				const cartChanges = {
					products: [ product ],
				};

				render(
					<QueryClientProvider client={ queryClient }>
						<MyCheckoutSummary cartChanges={ cartChanges } />
					</QueryClientProvider>
				);

				await waitFor( () => {
					productFeatures.map( ( feature ) => {
						expect( screen.queryByText( feature ) ).toBeInTheDocument();
					} );
				} );
			} );
		} );

		// Ensure deprecated Security T2 and Backup T2 plans do not show a feature list
		allNonFeatureListJetpackProductsSlugs.forEach( ( product ) => {
			const { product_name, bill_period, product_slug } = product;

			test( `Deprecated T2 plan ${ product_name } ${ bill_period } does not show feature list`, async () => {
				const product = convertProductSlugToResponseProduct( product_slug );
				const productFeatures = getJetpackProductFeatures( product, identity as translateType );

				expect( productFeatures.length ).toEqual( 0 );
			} );
		} );

		test( 'No feature list items show up if there are multiple items in the cart', async () => {
			const cartChanges = {
				products: allJetpackProducts,
			};

			render(
				<QueryClientProvider client={ queryClient }>
					<MyCheckoutSummary cartChanges={ cartChanges } />
				</QueryClientProvider>
			);

			await waitFor( async () => {
				allJetpackFeatures.forEach( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );

		test( 'No feature list items show up if the cart is empty', async () => {
			const cartChanges = { products: [] };

			render(
				<QueryClientProvider client={ queryClient }>
					<MyCheckoutSummary cartChanges={ cartChanges } />
				</QueryClientProvider>
			);

			await waitFor( async () => {
				allJetpackFeatures.forEach( ( feature ) => {
					expect( screen.queryByText( feature ) ).toBeNull();
				} );
			} );
		} );
	} );
} );
