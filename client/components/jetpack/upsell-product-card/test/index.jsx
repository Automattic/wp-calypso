/**
 * @jest-environment jsdom
 */
import { PRODUCT_JETPACK_SCAN } from '@automattic/calypso-products';
import { FEATURE_TYPE_JETPACK_SCAN } from '@automattic/calypso-products/src/constants/features';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UpsellProductCard from 'calypso/components/jetpack/upsell-product-card';

jest.mock( 'calypso/state/ui/selectors/get-selected-site-id', () => jest.fn() );

jest.mock( 'calypso/my-sites/plans/jetpack-plans/use-item-price', () =>
	jest.fn().mockReturnValue( {
		originalPrice: 10,
		discountedPrice: 5,
		discountedPriceDuration: 1,
		priceTierList: [ 'free', 'personal', 'premium', 'business' ],
		isFetching: false,
	} )
);

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

	test( 'onClick to render lightbox is clicked', async () => {
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
} );
