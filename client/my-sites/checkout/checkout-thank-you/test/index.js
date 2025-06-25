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
	isDotComPlan: jest.fn( () => false ),
	isDIFMProduct: jest.fn( () => false ),
} ) );

jest.unmock( '@automattic/help-center/src/hooks' );
jest.mock( '@automattic/help-center/src/hooks', () => ( {
	...jest.requireActual( '@automattic/help-center/src/hooks' ),
	useProductsWithPremiumSupport: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: () => null,
} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => 'page-view-tracker' );
jest.mock( '../header', () =>
	jest.fn( ( { children } ) => <div data-testid="checkout-thank-you-header">{ children }</div> )
);
// eslint-disable-next-line react/display-name
jest.mock( 'calypso/components/happiness-support', () => () => (
	<div data-testid="happiness-support" />
) );
jest.mock( '../transfer-pending/', () => () => 'transfer-pending' );
// eslint-disable-next-line react/display-name
jest.mock( '../redesign-v2/pages/plan-only', () => () => (
	<div data-testid="component--plan-only-thank-you" />
) );
// eslint-disable-next-line react/display-name
jest.mock( '../redesign-v2/pages/generic', () => () => (
	<div data-testid="component--generic-thank-you" />
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
			const { container } = render(
				<Provider store={ store }>
					<CheckoutThankYou { ...defaultProps } receiptId={ 12 } />
				</Provider>
			);
			// TODO: `WordPressLogo` should probably be updated to pass through props like `data-testid`
			expect( container.querySelector( '.checkout-thank-you__logo' ) ).toBeVisible();
		} );
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

		expect( await screen.getByTestId( 'component--plan-only-thank-you' ) ).toBeInTheDocument();
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
