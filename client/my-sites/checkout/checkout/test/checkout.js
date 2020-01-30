/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { Checkout } from '../';
import { hasPendingPayment } from 'lib/cart-values';
import { isEnabled } from 'config';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';

let mockGSuiteCountryIsValid = true;
jest.mock( 'lib/user', () =>
	jest.fn( () => ( {
		get: () => ( { is_valid_google_apps_country: mockGSuiteCountryIsValid } ),
	} ) )
);
jest.mock( 'lib/transaction/actions', () => ( {
	resetTransaction: jest.fn(),
} ) );
jest.mock( 'lib/signup/step-actions', () => ( {} ) );
jest.mock( 'lib/analytics', () => ( {
	tracks: {
		recordEvent: jest.fn(),
	},
} ) );
jest.mock( 'lib/analytics/ad-tracking', () => ( {
	recordViewCheckout: jest.fn(),
} ) );
jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );
jest.mock( 'lib/abtest', () => ( {
	abtest() {},
	getABTestVariation() {},
} ) );
jest.mock( 'lib/abtest/active-tests', () => ( {} ) );
jest.mock( 'lib/cart-values', () => ( {
	cartItems: {
		getAll: jest.fn( false ),
		hasFreeTrial: jest.fn( false ),
		hasGoogleApps: jest.fn( false ),
		hasDomainRegistration: jest.fn( false ),
		hasRenewalItem: jest.fn( false ),
		hasOnlyRenewalItems: jest.fn( false ),
		hasTransferProduct: jest.fn( false ),
	},
	isPaymentMethodEnabled: jest.fn( false ),
	paymentMethodName: jest.fn( false ),
	getEnabledPaymentMethods: jest.fn( false ),
	hasPendingPayment: jest.fn(),
} ) );

jest.mock( 'config', () => {
	const mock = () => 'development';
	mock.isEnabled = jest.fn();
	return mock;
} );

//jsdom doesn't properly mock scrollTo
global.scrollTo = () => {};

describe( 'Checkout', () => {
	const defaultProps = {
		cards: [],
		cart: {
			products: [],
		},
		translate: identity,
		loadTrackingTool: identity,
		transaction: {
			step: {},
		},
		setHeaderText: identity,
		clearPurchases: identity,
		fetchReceiptCompleted: identity,
		previousRoute: '',
	};

	beforeAll( () => {
		global.window = {
			scrollTo: identity,
			document: {
				documentElement: {},
			},
		};
	} );

	test( 'should render and not blow up', () => {
		const checkout = shallow( <Checkout { ...defaultProps } /> );
		expect( checkout.find( '.checkout' ) ).toHaveLength( 1 );
	} );

	test( 'should set state.cartSettled to false', () => {
		let checkout;

		checkout = shallow(
			<Checkout { ...defaultProps } cart={ { hasLoadedFromServer: false, products: [] } } />
		);
		expect( checkout.state().cartSettled ).toBe( false );

		checkout = shallow(
			<Checkout { ...defaultProps } cart={ { hasLoadedFromServer: true, products: [] } } />
		);
		expect( checkout.state().cartSettled ).toBe( false );
	} );

	test( 'should set state.cartSettled to true after cart has loaded', () => {
		const checkout = shallow(
			<Checkout { ...defaultProps } cart={ { hasLoadedFromServer: false, products: [] } } />
		);
		expect( checkout.state().cartSettled ).toBe( false );

		checkout.setProps( { cart: { hasLoadedFromServer: true, products: [] } } );
		expect( checkout.state().cartSettled ).toBe( true );
	} );

	test( 'should keep state.cartSettled as true even after cart reloads', () => {
		const checkout = shallow(
			<Checkout { ...defaultProps } cart={ { hasLoadedFromServer: false, products: [] } } />
		);
		expect( checkout.state().cartSettled ).toBe( false );

		checkout.setProps( { cart: { hasLoadedFromServer: true, products: [] } } );
		expect( checkout.state().cartSettled ).toBe( true );

		checkout.setProps( { cart: { hasLoadedFromServer: false, products: [] } } );
		expect( checkout.state().cartSettled ).toBe( true );
	} );

	test( 'checkout blocked on pending payment', () => {
		isEnabled.mockImplementation( flag => flag === 'async-payments' );
		hasPendingPayment.mockImplementation( cart => cart && cart.has_pending_payment );

		const wrapper = shallow( <Checkout { ...defaultProps } /> );

		// Need to generate a prop update in order to set cartSettled correctly.
		// cartSettled isn't derived from props on init so setting the cart above
		// does nothing.
		wrapper.setProps( {
			cart: { hasLoadedFromServer: true, products: [], has_pending_payment: true },
		} );

		expect( wrapper.find( 'Localized(PendingPaymentBlocker)' ) ).toHaveLength( 1 );
	} );

	describe( 'provides a handleCheckoutCompleteRedirect function to its children that', () => {
		let container;
		const Redirector = ( { handleCheckoutCompleteRedirect } ) => {
			handleCheckoutCompleteRedirect();
			return null;
		};

		beforeEach( () => {
			mockGSuiteCountryIsValid = true;
			container = document.createElement( 'div' );
			document.body.appendChild( container );
		} );

		afterEach( () => {
			document.body.removeChild( container );
		} );

		it( 'redirects to the root page when no site is set', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout { ...defaultProps } performRedirectTo={ performRedirectTo }>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/' );
		} );

		it( 'redirects to the thank-you page with a purchase id when a site and purchaseId is set', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					purchaseId={ '1234abcd' }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );

		it( 'redirects to the thank-you page with a receipt id when a site and transaction receipt_id is set', () => {
			const performRedirectTo = jest.fn();
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );

		it( 'redirects to the thank-you pending page with a order id when a site and transaction orderId is set', () => {
			const performRedirectTo = jest.fn();
			const transaction = {
				step: { data: { orderId: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/foo.bar/pending/1234abcd'
			);
		} );

		it( 'redirects to the thank-you page with a placeholder receiptId with a site when the cart is not empty but there is no receipt id', () => {
			const performRedirectTo = jest.fn();
			const cart = { products: [ { id: 'something' } ] };
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/:receiptId' );
		} );

		it( 'redirects to the thank-you page with a feature when a site, a purchase id, and a valid feature is set', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					selectedFeature="all-free-features"
					purchaseId={ '1234abcd' }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/features/all-free-features/foo.bar/1234abcd'
			);
		} );

		it( 'redirects to the thank-you page with a feature when a site, a receipt id, and a valid feature is set', () => {
			const performRedirectTo = jest.fn();
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					selectedFeature="all-free-features"
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/features/all-free-features/foo.bar/1234abcd'
			);
		} );

		it( 'redirects to the thank-you pending page with a feature when a site, an order id, and a valid feature is set', () => {
			const performRedirectTo = jest.fn();
			const transaction = {
				step: { data: { orderId: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					selectedFeature="all-free-features"
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/features/all-free-features/foo.bar/pending/1234abcd'
			);
		} );

		it( 'redirects to the thank-you page with a feature when a site and a valid feature is set with no receipt but the cart is not empty', () => {
			const performRedirectTo = jest.fn();
			const cart = { products: [ { id: 'something' } ] };
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					selectedFeature="all-free-features"
					cart={ cart }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/features/all-free-features/foo.bar/:receiptId'
			);
		} );

		it( 'redirects to the thank-you page without a feature when a site, a purchase id, and an invalid feature is set', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					selectedFeature="fake-key"
					purchaseId={ '1234abcd' }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );

		it( 'redirects to the plans page with thank-you query string if there is a non-atomic jetpack product', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					purchaseId={ '1234abcd' }
					isJetpackNotAtomic={ true }
					product="jetpack_backup_daily"
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/plans/my-plan/foo.bar?thank-you=true&product=jetpack_backup_daily'
			);
		} );

		it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic jetpack plan', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					purchaseId={ '1234abcd' }
					isJetpackNotAtomic={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/plans/my-plan/foo.bar?thank-you=true&install=all'
			);
		} );

		it( 'redirects to the plans page with thank-you query string and jetpack onboarding if there is a non-atomic jetpack plan even if there is a feature', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					purchaseId={ '1234abcd' }
					selectedFeature="all-free-features"
					isJetpackNotAtomic={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/plans/my-plan/foo.bar?thank-you=true&install=all'
			);
		} );

		it( 'redirects to internal redirectTo url if set', () => {
			const performRedirectTo = jest.fn();
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					redirectTo={ '/foo/bar' }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/foo/bar' );
		} );

		it( 'redirects to the root url if redirectTo does not start with admin_url for site', () => {
			const performRedirectTo = jest.fn();
			const adminUrl = 'https://my.site/wp-admin/';
			const redirectTo = 'https://other.site/post.php?post=515';
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					selectedSite={ { options: { admin_url: adminUrl } } }
					redirectTo={ redirectTo }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/' );
		} );

		it( 'redirects to external redirectTo url if it starts with admin_url for site', () => {
			const performRedirectTo = jest.fn();
			const adminUrl = 'https://my.site/wp-admin/';
			const redirectTo = adminUrl + 'post.php?post=515';
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					selectedSite={ { options: { admin_url: adminUrl } } }
					redirectTo={ redirectTo }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				redirectTo + '&action=edit&plan_upgraded=1'
			);
		} );

		it( 'redirects to manage purchase page if there is a renewal', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{ extra: { purchaseType: 'renewal', purchaseDomain: 'foo.bar', purchaseId: '123abc' } },
				],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/me/purchases/foo.bar/123abc' );
		} );

		it( 'does not redirect to url from cookie if isEligibleForSignupDestination is false', () => {
			const performRedirectTo = jest.fn();
			const getUrlFromCookie = jest.fn( () => '/cookie' );
			const cart = {
				products: [ { product_slug: 'foo' } ],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					performRedirectTo={ performRedirectTo }
					getUrlFromCookie={ getUrlFromCookie }
					isEligibleForSignupDestination={ false }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/:receiptId' );
		} );

		it( 'redirects to url from cookie if isEligibleForSignupDestination is set', () => {
			const performRedirectTo = jest.fn();
			const getUrlFromCookie = jest.fn( () => '/cookie' );
			const cart = {
				products: [ { product_slug: 'foo' } ],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					performRedirectTo={ performRedirectTo }
					getUrlFromCookie={ getUrlFromCookie }
					isEligibleForSignupDestination={ true }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/cookie' );
		} );

		it( 'redirects to url from cookie if cart is empty and no receipt is set', () => {
			const performRedirectTo = jest.fn();
			const getUrlFromCookie = jest.fn( () => '/cookie' );
			const cart = {
				products: [],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					performRedirectTo={ performRedirectTo }
					getUrlFromCookie={ getUrlFromCookie }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/cookie' );
		} );

		it( 'redirects to url from cookie followed by purchase id if create_new_blog is set', () => {
			const performRedirectTo = jest.fn();
			const getUrlFromCookie = jest.fn( () => '/cookie' );
			const cart = {
				create_new_blog: true,
				products: [ { id: '123' } ],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					purchaseId={ '1234abcd' }
					performRedirectTo={ performRedirectTo }
					getUrlFromCookie={ getUrlFromCookie }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/cookie/1234abcd' );
		} );

		it( 'redirects to url from cookie followed by receipt id if create_new_blog is set', () => {
			const performRedirectTo = jest.fn();
			const getUrlFromCookie = jest.fn( () => '/cookie' );
			const cart = {
				create_new_blog: true,
				products: [ { id: '123' } ],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
					getUrlFromCookie={ getUrlFromCookie }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/cookie/1234abcd' );
		} );

		it( 'redirects to url from cookie followed by the pending order id if create_new_blog is set', () => {
			const performRedirectTo = jest.fn();
			const getUrlFromCookie = jest.fn( () => '/cookie' );
			const cart = {
				create_new_blog: true,
				products: [ { id: '123' } ],
			};
			const transaction = {
				step: { data: { orderId: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
					getUrlFromCookie={ getUrlFromCookie }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/cookie/pending/1234abcd' );
		} );

		it( 'redirects to url from cookie followed by placeholder receiptId if create_new_blog is set and there is no receipt', () => {
			const performRedirectTo = jest.fn();
			const getUrlFromCookie = jest.fn( () => '/cookie' );
			const cart = {
				create_new_blog: true,
				products: [ { id: '123' } ],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					performRedirectTo={ performRedirectTo }
					getUrlFromCookie={ getUrlFromCookie }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/cookie/:receiptId' );
		} );

		// Note: This just verifies the existing behavior; I suspect this is a bug
		it( 'redirects to thank-you page followed by placeholder receiptId twice if no cookie url is set, create_new_blog is set, and there is no receipt', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				create_new_blog: true,
				products: [ { id: '123' } ],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/foo.bar/:receiptId/:receiptId'
			);
		} );

		// Note: This just verifies the existing behavior; I suspect this is a bug
		it( 'redirects to thank-you page followed by purchase id twice if no cookie url is set, create_new_blog is set, and there is no receipt', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				create_new_blog: true,
				products: [ { id: '123' } ],
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					purchaseId={ '1234abcd' }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/foo.bar/1234abcd/1234abcd'
			);
		} );

		it( 'redirects to thank-you page for a new site with a domain and some failed purchases', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'some_domain',
						is_domain_registration: true,
						extra: { context: 'signup' },
						meta: 'my.site',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: { foo: 'bar' } } },
			};
			mockGSuiteCountryIsValid = true;
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					isNewlyCreatedSite={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );

		it( 'redirects to thank-you page (with display mode) for a new site with a domain and no failed purchases but GSuite is in the cart', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'gapps',
						meta: 'my.site',
					},
					{
						product_slug: 'some_domain',
						is_domain_registration: true,
						extra: { context: 'signup' },
						meta: 'my.site',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			mockGSuiteCountryIsValid = true;
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					isNewlyCreatedSite={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/foo.bar/1234abcd?d=gsuite'
			);
		} );

		it( 'redirects to thank-you page for a new site (via isNewlyCreatedSite) without a domain', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'some_domain',
						is_domain_registration: false,
						extra: { context: 'signup' },
						meta: 'my.site',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			mockGSuiteCountryIsValid = false;
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					isNewlyCreatedSite={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );

		it( 'redirects to thank-you page (with concierge display mode) for a new site with a domain and no failed purchases but concierge is in the cart', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{ product_slug: 'concierge-session' },
					{
						product_slug: 'some_domain',
						is_domain_registration: true,
						extra: { context: 'signup' },
						meta: 'my.site',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			mockGSuiteCountryIsValid = false;
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					isNewlyCreatedSite={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/foo.bar/1234abcd?d=concierge'
			);
		} );

		it( 'redirects to thank-you page for a new site with a domain and no failed purchases but neither GSuite nor concierge are in the cart if user is in invalid country', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'some_domain',
						is_domain_registration: true,
						extra: { context: 'signup' },
						meta: 'my.site',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			mockGSuiteCountryIsValid = false;
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					isNewlyCreatedSite={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );

		it( 'redirects to gsuite nudge for a new site with a domain and no failed purchases but neither GSuite nor concierge are in the cart', () => {
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'some_domain',
						is_domain_registration: true,
						extra: { context: 'signup' },
						meta: 'my.site',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			mockGSuiteCountryIsValid = true;
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					isNewlyCreatedSite={ true }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/foo.bar/with-gsuite/my.site/1234abcd'
			);
		} );

		it( 'redirects to premium upgrade nudge if concierge and jetpack are not in the cart, personal is in the cart, and the previous route is not the nudge', () => {
			isEnabled.mockImplementation( flag => flag === 'upsell/concierge-session' );
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'personal-bundle',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/foo.bar/offer-plan-upgrade/premium/1234abcd'
			);
		} );

		it( 'redirects to concierge nudge if concierge and jetpack are not in the cart, blogger is in the cart, and the previous route is not the nudge', () => {
			isEnabled.mockImplementation( flag => flag === 'upsell/concierge-session' );
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'blogger-bundle',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/offer-quickstart-session/1234abcd/foo.bar'
			);
		} );

		it( 'redirects to concierge nudge if concierge and jetpack are not in the cart, premium is in the cart, and the previous route is not the nudge', () => {
			isEnabled.mockImplementation( flag => flag === 'upsell/concierge-session' );
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'value_bundle',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/offer-quickstart-session/1234abcd/foo.bar'
			);
		} );

		it( 'redirects to thank-you page (with concierge display mode) if concierge is in the cart', () => {
			isEnabled.mockImplementation( flag => flag === 'upsell/concierge-session' );
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'concierge-session',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith(
				'/checkout/thank-you/foo.bar/1234abcd?d=concierge'
			);
		} );

		it( 'redirects to thank-you page if jetpack is in the cart', () => {
			isEnabled.mockImplementation( flag => flag === 'upsell/concierge-session' );
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'jetpack_premium',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );

		it( 'redirects to thank you page if concierge and jetpack are not in the cart, personal is in the cart, but the previous route is the nudge', () => {
			isEnabled.mockImplementation( flag => flag === 'upsell/concierge-session' );
			const performRedirectTo = jest.fn();
			const cart = {
				products: [
					{
						product_slug: 'personal-bundle',
					},
				],
			};
			const transaction = {
				step: { data: { receipt_id: '1234abcd', purchases: {}, failed_purchases: {} } },
			};
			render(
				<Checkout
					{ ...defaultProps }
					selectedSiteSlug={ 'foo.bar' }
					cart={ cart }
					transaction={ transaction }
					performRedirectTo={ performRedirectTo }
					previousRoute="/checkout/foo.bar/offer-plan-upgrade/premium/1234abcd"
				>
					<Redirector />
				</Checkout>,
				container
			);
			expect( performRedirectTo ).toHaveBeenCalledWith( '/checkout/thank-you/foo.bar/1234abcd' );
		} );
	} );
} );
