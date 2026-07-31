/**
 * @jest-environment jsdom
 */
import { PRODUCT_JETPACK_SCAN, FEATURE_TYPE_JETPACK_SCAN } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';
import SingleSiteUpsellLightbox from 'calypso/jetpack-cloud/sections/partner-portal/single-site-upsell-lightbox';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn() );

jest.mock( 'calypso/my-sites/plans/jetpack-plans/use-item-price', () =>
	jest.fn().mockReturnValue( {
		originalPrice: 10,
		originalPriceTotal: 10,
		discountedPrice: 5,
		discountPriceTotal: 5,
		discountedPriceDuration: 1,
		priceTierList: [ 'free', 'personal', 'premium', 'business' ],
		isFetching: false,
	} )
);

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

describe( 'SingleSiteUpsellLightbox', () => {
	test( 'button link for non manage users is to the WordPress.com purchase page', async () => {
		const firstState = {
			partnerPortal: {
				partner: {
					current: {
						keys: { id: 1 },
					},
					activePartnerKey: 1,
				},
				licenses: {
					paginated: null,
				},
			},
			sites: {
				products: {
					2916284: {
						data: {
							jetpack_scan: { available: true },
						},
					},
				},
			},
		};

		const queryClient = new QueryClient();
		const mockStore = configureStore();
		const store = mockStore( firstState );

		const mockOnClick = jest.fn();
		// Render component
		render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<UpsellProductCard
						featureType={ FEATURE_TYPE_JETPACK_SCAN }
						nonManageProductSlug={ PRODUCT_JETPACK_SCAN }
						siteId={ 2916284 }
						onCtaButtonClick={ mockOnClick }
					/>
				</QueryClientProvider>
			</Provider>
		);

		expect( screen.getByRole( 'link' ) ).toHaveClass( 'jetpack-rna-action-card__button' );
		expect( screen.getByRole( 'link' ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/checkout/jetpack/jetpack_scan?redirect_to=https%3A%2F%2Fexample.com%2F'
		);
	} );

	test( 'button link for manage users does not open the WordPress.com checkout', async () => {
		const secondState = {
			partnerPortal: {
				partner: {
					current: {
						keys: { id: 1 },
					},
					activePartnerKey: 1,
				},
				licenses: {
					paginated: null,
				},
			},
			sites: {
				products: {
					2916284: {
						data: {
							jetpack_scan: { available: true },
						},
					},
				},
			},
			currentUser: {
				user: {
					has_jetpack_partner_access: true,
				},
			},
		};
		const queryClient = new QueryClient();
		const mockStore = configureStore();
		const store = mockStore( secondState );

		const mockOnClick = jest.fn();
		// Render component
		render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<UpsellProductCard
						featureType={ FEATURE_TYPE_JETPACK_SCAN }
						nonManageProductSlug={ PRODUCT_JETPACK_SCAN }
						siteId={ 2916284 }
						onCtaButtonClick={ mockOnClick }
					/>
				</QueryClientProvider>
			</Provider>
		);

		expect( screen.getByRole( 'link' ) ).toHaveClass( 'jetpack-rna-action-card__button' );
		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', '#' );

		fireEvent.click( screen.getByText( 'Add Jetpack Scan' ) );

		expect( mockOnClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'lightbox buttons and close icon act as expected', () => {
		const createFakeApiProduct = {
			name: 'Jetpack Scan Daily',
			slug: 'jetpack-scan',
			product_id: 2106,
			currency: 'USD',
			amount: 0,
			price_interval: 'month',
			family_slug: 'jetpack-scan',
		};

		const secondState = {
			partnerPortal: {
				partner: {
					current: {
						keys: { id: 1 },
					},
					activePartnerKey: 1,
				},
				licenses: {
					paginated: null,
				},
			},
			sites: {
				products: {
					2916284: {
						data: {
							jetpack_scan: { available: true },
						},
					},
				},
			},
			currentUser: {
				user: {
					has_jetpack_partner_access: true,
				},
			},
			productsList: {
				items: {
					'jetpack-scan': createFakeApiProduct,
				},
			},
		};

		const queryClient = new QueryClient();
		const mockStore = configureStore();
		const store = mockStore( secondState );

		const mockOnClose = jest.fn();

		// Render component
		render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SingleSiteUpsellLightbox
						manageProduct={ createFakeApiProduct }
						onClose={ mockOnClose }
						nonManageProductSlug="jetpack_scan"
						nonManageProductPrice={ null }
						partnerCanIssueLicense
						siteId={ 2916284 }
					/>
				</QueryClientProvider>
			</Provider>
		);

		const lightboxElement = document.querySelectorAll( '.jetpack-lightbox__content-wrapper' );
		const issueLicenseButton = within( lightboxElement[ 0 ] ).getByText( 'Issue license' );
		const closeIcon = screen.getByLabelText( 'Close' );

		expect( screen.getByText( 'Purchase via Jetpack.com' ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/checkout/jetpack/jetpack_scan?redirect_to=https%3A%2F%2Fexample.com%2F'
		);

		expect( issueLicenseButton ).toHaveClass( 'button license-lightbox__cta-button is-primary' );

		fireEvent.click( issueLicenseButton );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_jetpack_single_site_upsell_purchase_click',
			expect.objectContaining( {
				product: 'jetpack-scan',
			} )
		);

		fireEvent.click( closeIcon );
		expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
	} );
} );
