/**
 * @vitest-environment jsdom
 */

import { PLAN_ECOMMERCE, PLAN_PREMIUM, PLAN_PERSONAL } from '@automattic/calypso-products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { vi } from 'vitest';
import CheckoutThankYouHeader from '../header';
import CheckoutThankYouWithReceipt, { CheckoutThankYou } from '../index';
import { useCheckoutReceipt } from '../receipt';

vi.unmock( '@automattic/calypso-products' );
vi.mock( '@automattic/calypso-products', async () => ( {
	...( await vi.importActual( '@automattic/calypso-products' ) ),
	shouldFetchSitePlans: () => false,
	isDotComPlan: vi.fn( () => false ),
	isDIFMProduct: vi.fn( () => false ),
} ) );

vi.unmock( '@automattic/help-center/src/hooks' );
vi.mock( '@automattic/help-center/src/hooks', async () => ( {
	...( await vi.importActual( '@automattic/help-center/src/hooks' ) ),
	useProductsWithPremiumSupport: vi.fn( () => false ),
} ) );

vi.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: () => null,
} ) );
// The masterbar's help center reads the site through a query; these tests don't render one.
vi.mock( 'calypso/my-sites/checkout/src/hooks/use-checkout-site', async () => ( {
	...( await vi.importActual( 'calypso/my-sites/checkout/src/hooks/use-checkout-site' ) ),
	useCheckoutSite: () => ( { data: undefined } ),
} ) );
vi.mock( 'calypso/lib/analytics/page-view-tracker', () => ( {
	default: () => 'page-view-tracker',
} ) );
vi.mock( '../header', () => ( {
	default: vi.fn( ( { children } ) => (
		<div data-testid="checkout-thank-you-header">{ children }</div>
	) ),
} ) );
// eslint-disable-next-line react/display-name
vi.mock( 'calypso/components/happiness-support', () => ( {
	default: () => <div data-testid="happiness-support" />,
} ) );
vi.mock( '../transfer-pending/', () => ( { default: () => 'transfer-pending' } ) );
// eslint-disable-next-line react/display-name
vi.mock( '../redesign-v2/pages/plan-only', () => ( {
	default: () => <div data-testid="component--plan-only-thank-you" />,
} ) );
// eslint-disable-next-line react/display-name
vi.mock( '../redesign-v2/pages/generic', () => ( {
	default: () => <div data-testid="component--generic-thank-you" />,
} ) );
// eslint-disable-next-line react/display-name
vi.mock( '../redesign-v2/pages/domain-only', () => ( {
	__esModule: true,
	default: () => <div data-testid="component--domain-only-thank-you" />,
} ) );
vi.mock( '../receipt', async () => ( {
	...( await vi.importActual( '../receipt' ) ),
	useCheckoutReceipt: vi.fn(),
} ) );
vi.mock( '../studio-thank-you', () => ( {
	__esModule: true,
	default: () => <div data-testid="component--studio-thank-you" />,
} ) );

const translate = ( x ) => x;

const defaultProps = {
	translate,
	loadTrackingTool: () => {},
	siteHomeUrl: '',
	domainOnlySiteFlow: false,
	hasReceivedRemotePreferences: true,
};

const initialState = {
	purchases: {
		isFetchingSitePurchases: true,
	},
	preferences: {
		fetching: false,
		remoteValues: {},
	},
	ui: {
		section: { name: 'checkout-thank-you' },
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
		const mockStore = configureStore( [ thunk ] );
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
			hasLoadedReceipts: true,
			receipt: {
				purchases: [ { productSlug: 'jetpack_personal' } ],
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
			hasLoadedReceipts: true,
			receipt: {
				purchases: [ { productSlug: PLAN_PERSONAL } ],
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

	describe( 'eCommerce plan purchase', () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			selectedSite: {
				ID: 12,
			},
			sitePlans: {
				hasLoadedFromServer: true,
			},
			hasLoadedReceipts: true,
			receipt: {
				purchases: [ { productSlug: PLAN_ECOMMERCE } ],
			},
			refreshSitePlans: ( selectedSite ) => selectedSite,
			transferComplete: true,
		};

		it( 'keeps showing the transfer screen until WooCommerce is installed', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } isWooCommerceInstalled={ false } />
				</Provider>
			);

			expect( screen.getByText( 'transfer-pending' ) ).toBeVisible();
		} );

		it( 'shows the thank-you page once WooCommerce is installed', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } isWooCommerceInstalled />
				</Provider>
			);

			expect( screen.queryByText( 'transfer-pending' ) ).not.toBeInTheDocument();
			expect( screen.getByTestId( 'component--plan-only-thank-you' ) ).toBeVisible();
		} );
	} );

	describe( 'domain-only page', () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			hasLoadedReceipts: true,
			receipt: {
				purchases: [
					{
						isDomainRegistration: true,
						productSlug: 'dotcom_domain',
						productType: 'domain',
						meta: 'example.com',
						blogId: 123,
						isHundredYearDomain: false,
						delayedProvisioning: false,
					},
				],
				currency: 'USD',
			},
			refreshSitePlans: () => {},
		};

		it( 'renders the DomainOnly page when purchasing a domain in a domain-only site flow', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } domainOnlySiteFlow />
				</Provider>
			);

			expect( screen.getByTestId( 'component--domain-only-thank-you' ) ).toBeVisible();
		} );

		it( 'does not render the DomainOnly page when purchasing a domain outside a domain-only site flow', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } domainOnlySiteFlow={ false } />
				</Provider>
			);

			expect( screen.queryByTestId( 'component--domain-only-thank-you' ) ).not.toBeInTheDocument();
			expect( screen.getByTestId( 'component--generic-thank-you' ) ).toBeVisible();
		} );
	} );

	describe( 'Studio checkout', () => {
		const props = {
			...defaultProps,
			receiptId: 12,
			hasLoadedReceipts: true,
			domainOnlySiteFlow: true,
			receipt: {
				purchases: [ { productSlug: 'studio-cloud-monthly', productName: 'Studio Cloud' } ],
				currency: 'USD',
			},
			refreshSitePlans: () => {},
		};

		it( 'renders the Studio thank-you page when checkout_type is studio', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } checkoutType="studio" />
				</Provider>
			);

			expect( screen.getByTestId( 'component--studio-thank-you' ) ).toBeVisible();
			expect( screen.queryByTestId( 'component--generic-thank-you' ) ).not.toBeInTheDocument();
		} );

		it( "keeps a site's own thank-you page when checkout_type is studio", () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou
						{ ...props }
						domainOnlySiteFlow={ false }
						selectedSite={ { ID: 12, slug: 'example.com' } }
						sitePlans={ { hasLoadedFromServer: true } }
						checkoutType="studio"
					/>
				</Provider>
			);

			expect( screen.queryByTestId( 'component--studio-thank-you' ) ).not.toBeInTheDocument();
			expect( screen.getByTestId( 'component--generic-thank-you' ) ).toBeVisible();
		} );

		it( 'renders the generic thank-you page for the same purchase without the flag', () => {
			render(
				<Provider store={ store }>
					<CheckoutThankYou { ...props } />
				</Provider>
			);

			expect( screen.getByTestId( 'component--generic-thank-you' ) ).toBeVisible();
		} );

		describe( 'with the receipt loaded', () => {
			function renderWithReceiptCheckoutType( receiptCheckoutType, extraProps = {} ) {
				useCheckoutReceipt.mockImplementation( ( receiptId ) =>
					receiptId
						? {
								data: { ...props.receipt, checkoutType: receiptCheckoutType },
								isLoading: false,
								isSuccess: true,
							}
						: { data: undefined, isLoading: false, isSuccess: false }
				);

				render(
					<QueryClientProvider client={ new QueryClient() }>
						<Provider store={ store }>
							<CheckoutThankYouWithReceipt
								{ ...defaultProps }
								receiptId={ 12 }
								domainOnlySiteFlow
								checkoutType="studio"
								{ ...extraProps }
							/>
						</Provider>
					</QueryClientProvider>
				);
			}

			it( 'renders the Studio page when the receipt records a studio checkout', () => {
				renderWithReceiptCheckoutType( 'studio', { checkoutType: undefined } );

				expect( screen.getByTestId( 'component--studio-thank-you' ) ).toBeVisible();
			} );

			it( 'lets a wpcom receipt win over a studio flag in the URL', () => {
				renderWithReceiptCheckoutType( 'wpcom' );

				expect( screen.queryByTestId( 'component--studio-thank-you' ) ).not.toBeInTheDocument();
			} );

			it( 'keeps the URL flag until the receipt says otherwise', () => {
				renderWithReceiptCheckoutType( undefined );

				expect( screen.getByTestId( 'component--studio-thank-you' ) ).toBeVisible();
			} );
		} );
	} );
} );
