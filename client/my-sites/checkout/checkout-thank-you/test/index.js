/**
 * @jest-environment jsdom
 */

import {
	PLAN_ECOMMERCE,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	isDotComPlan,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CheckoutThankYouHeader from '../header';
import { CheckoutThankYou } from '../index';

jest.unmock( '@automattic/calypso-products' );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	shouldFetchSitePlans: () => false,
	isDotComPlan: jest.fn( () => false ),
	isDIFMProduct: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: () => null,
} ) );
jest.mock( '../domain-registration-details', () => () => 'component--domain-registration-details' );
jest.mock( '../google-apps-details', () => () => 'component--google-apps-details' );
jest.mock( '../jetpack-plan-details', () => () => 'component--jetpack-plan-details' );
jest.mock( '../redesign-v2/sections/Footer', () => () => 'component--redesign-v2-footer' );
jest.mock( '../atomic-store-thank-you-card', () => () => (
	<div data-testid="atomic-store-thank-you-card" />
) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => 'page-view-tracker' );
jest.mock( '../header', () =>
	jest.fn( ( { children } ) => <div data-testid="checkout-thank-you-header">{ children }</div> )
);
jest.mock( 'calypso/components/happiness-support', () => () => (
	<div data-testid="happiness-support" />
) );
jest.mock( 'calypso/components/wordpress-logo', () => () => <div data-testid="wordpress-logo" /> );
jest.mock( '../premium-plan-details', () => () => 'premium-plan-details' );
jest.mock( '../business-plan-details', () => () => <div data-testid="business-plan-details" /> );
jest.mock( '../transfer-pending/', () => () => 'transfer-pending' );

const translate = ( x ) => x;

const defaultProps = {
	translate,
	receipt: {
		data: {},
	},
	loadTrackingTool: () => {},
	fetchReceipt: () => {},
	siteHomeUrl: '',
	domainOnlySiteFlow: false,
};

const initialState = {
	purchases: {
		isFetchingSitePurchases: true,
	},
};

describe( 'CheckoutThankYou', () => {
	let originalScrollTo;
	let store;

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = () => null;
	} );

	beforeEach( () => {
		const mockStore = configureStore();
		store = mockStore( initialState );
		CheckoutThankYouHeader.mockClear();
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;
	} );

	describe( 'Basic tests', () => {
		test( 'should not blow up and have proper CSS class', () => {
			const { container } = render(
				<Provider store={ store }>
					<CheckoutThankYou { ...defaultProps } />
				</Provider>
			);
			expect( container.firstChild ).toHaveClass( 'checkout-thank-you' );
		} );

		test( 'Show WordPressLogo when there are no purchase but a receipt is present', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...defaultProps } receiptId={ 12 } />
				</Provider>
			);
			expect( screen.getByTestId( 'wordpress-logo' ) ).toBeVisible();
		} );
	} );

	describe( 'Simplified page', () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			receipt: {
				hasLoadedFromServer: true,
				data: {
					purchases: [ { productSlug: PLAN_BUSINESS }, [] ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_BUSINESS,
		};

		test( 'Should display a full version when isSimplified is missing', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } />
				</Provider>
			);
			expect( screen.queryByTestId( 'business-plan-details' ) ).toBeVisible();
			expect( screen.queryByTestId( 'happiness-support' ) ).toBeVisible();
			expect( CheckoutThankYouHeader ).toHaveBeenCalledWith(
				expect.objectContaining( { isSimplified: undefined } ),
				expect.anything()
			);
		} );

		test( 'Should display a simplified version when isSimplified is set to true', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } isSimplified />
				</Provider>
			);
			expect( screen.queryByTestId( 'business-plan-details' ) ).not.toBeInTheDocument();
			expect( screen.queryByTestId( 'happiness-support' ) ).not.toBeInTheDocument();
			expect( CheckoutThankYouHeader ).toHaveBeenCalledWith(
				expect.objectContaining( { isSimplified: true } ),
				expect.anything()
			);
		} );

		test( 'Should pass props down to CheckoutThankYou', () => {
			render(
				<CheckoutThankYou
					{ ...props }
					isSimplified={ true }
					siteUnlaunchedBeforeUpgrade={ true }
					upgradeIntent="plugins"
				/>
			);
			expect( CheckoutThankYouHeader ).toHaveBeenCalledWith(
				expect.objectContaining( {
					siteUnlaunchedBeforeUpgrade: true,
					upgradeIntent: 'plugins',
				} ),
				expect.anything()
			);
		} );
	} );

	describe( 'Presence of <AtomicStoreThankYouCard /> in render() output', () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			receipt: {
				hasLoadedFromServer: true,
				data: {
					purchases: [ { productSlug: PLAN_ECOMMERCE }, [] ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_ECOMMERCE,
		};

		afterAll( () => {
			isDotComPlan.mockImplementation( () => false );
		} );

		test( 'Should be there for AT', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou
						{ ...props }
						transferComplete={ true }
						isWooCommerceInstalled={ true }
					/>
				</Provider>
			);
			expect( screen.queryByTestId( 'atomic-store-thank-you-card' ) ).toBeVisible();
		} );

		test( 'Should not be there for AT', () => {
			const { rerender } = render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } transferComplete={ false } />
				</Provider>
			);
			expect( screen.queryByTestId( 'atomic-store-thank-you-card' ) ).not.toBeInTheDocument();

			isDotComPlan.mockImplementation( () => true );

			rerender(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } />
				</Provider>
			);
			expect( screen.queryByTestId( 'atomic-store-thank-you-card' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'renders the failed purchases content if there are failed purchases', async () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			receipt: {
				hasLoadedFromServer: true,
				data: {
					purchases: [],
					failedPurchases: [ { productSlug: PLAN_PREMIUM } ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_PREMIUM,
		};

		render(
			<Provider store={ store }>
				<CheckoutThankYou { ...props } />
			</Provider>
		);

		expect( await screen.findByText( /These items could not be added/ ) ).toBeInTheDocument();
	} );

	it( 'renders the Jetpack plan content if the purchases include a Jetpack plan', async () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			receipt: {
				hasLoadedFromServer: true,
				data: {
					purchases: [ { productSlug: 'jetpack_personal' } ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_PREMIUM,
		};

		render(
			<Provider store={ store }>
				<CheckoutThankYou { ...props } />
			</Provider>
		);

		expect( await screen.findByText( 'component--jetpack-plan-details' ) ).toBeInTheDocument();
	} );

	it( 'renders the redesignV2 footer content if the purchases include a Personal plan', async () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			receipt: {
				hasLoadedFromServer: true,
				data: {
					purchases: [ { productSlug: PLAN_PERSONAL } ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_PREMIUM,
		};

		render(
			<Provider store={ store }>
				<CheckoutThankYou { ...props } />
			</Provider>
		);

		expect( await screen.findByText( 'component--redesign-v2-footer' ) ).toBeInTheDocument();
	} );
} );
