/**
 * @jest-environment jsdom
 */

import {
	PLAN_ECOMMERCE,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	isDotComPlan,
	WPCOM_DIFM_LITE,
	isDIFMProduct,
} from '@automattic/calypso-products';
import { render, screen } from '@testing-library/react';
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
jest.mock( 'calypso/my-sites/checkout/checkout-thank-you/difm/difm-lite-thank-you', () => () => (
	<div data-testid="difm-lite-thank-you" />
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

describe( 'CheckoutThankYou', () => {
	let originalScrollTo;

	beforeAll( () => {
		originalScrollTo = window.scrollTo;
		window.scrollTo = () => null;
	} );

	beforeEach( () => {
		CheckoutThankYouHeader.mockClear();
	} );

	afterAll( () => {
		window.scrollTo = originalScrollTo;
	} );

	describe( 'Basic tests', () => {
		test( 'should not blow up and have proper CSS class', () => {
			const { container } = render( <CheckoutThankYou { ...defaultProps } /> );
			expect( container.firstChild ).toHaveClass( 'checkout-thank-you' );
		} );

		test( 'Show WordPressLogo when there are no purchase but a receipt is present', () => {
			render( <CheckoutThankYou { ...defaultProps } receiptId={ 12 } /> );
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
			render( <CheckoutThankYou { ...props } /> );
			expect( screen.queryByTestId( 'business-plan-details' ) ).toBeVisible();
			expect( screen.queryByTestId( 'happiness-support' ) ).toBeVisible();
			expect( CheckoutThankYouHeader ).toHaveBeenCalledWith(
				expect.objectContaining( { isSimplified: undefined } ),
				expect.anything()
			);
		} );

		test( 'Should display a simplified version when isSimplified is set to true', () => {
			render( <CheckoutThankYou { ...props } isSimplified /> );
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
			render( <CheckoutThankYou { ...props } transferComplete={ true } /> );
			expect( screen.queryByTestId( 'atomic-store-thank-you-card' ) ).toBeVisible();
		} );

		test( 'Should not be there for AT', () => {
			const { rerender } = render( <CheckoutThankYou { ...props } transferComplete={ false } /> );
			expect( screen.queryByTestId( 'atomic-store-thank-you-card' ) ).not.toBeInTheDocument();

			isDotComPlan.mockImplementation( () => true );

			rerender( <CheckoutThankYou { ...props } /> );
			expect( screen.queryByTestId( 'atomic-store-thank-you-card' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Presence of <DIFMLiteThankYou /> in render() output', () => {
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
					purchases: [ { productSlug: PLAN_PREMIUM }, { productSlug: WPCOM_DIFM_LITE }, [] ],
				},
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			planSlug: PLAN_PREMIUM,
		};
		test( 'Should be there with DIFM product', () => {
			isDIFMProduct.mockImplementation( () => true );
			render( <CheckoutThankYou { ...props } /> );

			expect( screen.queryByTestId( 'difm-lite-thank-you' ) ).toBeVisible();
		} );

		test( 'Should not be there when no DIFM product', () => {
			isDIFMProduct.mockImplementation( () => false );

			render(
				<CheckoutThankYou
					{ ...{
						...props,
						receipt: {
							...props.receipt,
							data: {
								purchases: [ { productSlug: PLAN_PREMIUM }, [] ],
							},
						},
					} }
				/>
			);
			expect( screen.queryByTestId( 'difm-lite-thank-you' ) ).not.toBeInTheDocument();
		} );
	} );
} );
