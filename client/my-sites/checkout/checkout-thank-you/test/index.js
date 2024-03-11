/**
 * @jest-environment jsdom
 */

import { PLAN_PREMIUM, PLAN_PERSONAL } from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CheckoutThankYouHeader from '../header';
import { CheckoutThankYou } from '../index';

jest.unmock( '@automattic/calypso-products' );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	shouldFetchSitePlans: () => false,
	isDIFMProduct: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: () => null,
} ) );
jest.mock( '../domain-registration-details', () => () => 'component--domain-registration-details' );
jest.mock( '../google-apps-details', () => () => 'component--google-apps-details' );
jest.mock( '../jetpack-plan-details', () => () => 'component--jetpack-plan-details' );
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
jest.mock( '../redesign-v2/pages/plan-only', () => () => (
	<div data-testid="component--plan-only-thank-you" />
) );

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

	it( 'renders the <PlanOnlyThankYou> component if the purchases include a Personal plan', async () => {
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

		expect( await screen.getByTestId( 'component--plan-only-thank-you' ) ).toBeInTheDocument();
	} );
} );
