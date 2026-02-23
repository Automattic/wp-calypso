/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import nock from 'nock';
import { getFlowLocation, renderFlow } from 'calypso/landing/stepper/declarative-flow/test/helpers';
import { STEPS } from '../../../internals/steps';
import domainAndPlanFlow from '../domain-and-plan';

const originalLocation = window.location;

const mockAddProductsToCart = jest.fn();
const mockUseSite = jest.fn();

jest.mock( '@automattic/onboarding', () => ( {
	DOMAIN_AND_PLAN_FLOW: 'domain-and-plan',
	addProductsToCart: ( ...args ) => mockAddProductsToCart( ...args ),
	addPlanToCart: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => mockUseSite(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-slug', () => ( {
	useSiteSlug: () => 'example.wordpress.com',
} ) );

describe( 'Domain and Plan Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
			writable: true,
			configurable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
		mockUseSite.mockReturnValue( null );
		mockAddProductsToCart.mockResolvedValue( undefined );

		const apiBaseUrl = 'https://public-api.wordpress.com';
		nock( apiBaseUrl ).get( /.*/ ).reply( 200, {} ).persist();
		nock( apiBaseUrl ).post( /.*/ ).reply( 200, {} ).persist();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	describe( 'DOMAIN_SEARCH submit', () => {
		it( 'navigates to PLANS when the site has a free plan', () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: true, billing_period: '' },
			} );

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				dependencies: {
					domainItem: { product_slug: 'dotcom_domain' },
					domainCart: [ { product_slug: 'dotcom_domain' } ],
					signupDomainOrigin: 'free',
				},
				currentURL: '/domain-and-plan/domains?siteSlug=example.wordpress.com',
			} );

			const location = getFlowLocation();
			expect( location.path ).toContain( STEPS.PLANS.slug );
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );

		it( 'navigates to PLANS when the site has a monthly plan', () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: false, billing_period: 'Monthly' },
			} );

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				dependencies: {
					domainItem: { product_slug: 'dotcom_domain' },
					domainCart: [ { product_slug: 'dotcom_domain' } ],
					signupDomainOrigin: 'free',
				},
				currentURL: '/domain-and-plan/domains?siteSlug=example.wordpress.com',
			} );

			const location = getFlowLocation();
			expect( location.path ).toContain( STEPS.PLANS.slug );
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );

		it( 'skips PLANS and redirects to checkout when the site has a qualifying yearly plan', async () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: false, billing_period: 'Yearly' },
			} );

			const domainCartItem = { product_slug: 'dotcom_domain' };

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				dependencies: {
					domainItem: domainCartItem,
					domainCart: [ domainCartItem ],
					signupDomainOrigin: 'free',
				},
				currentURL: '/domain-and-plan/domains?siteSlug=example.wordpress.com',
			} );

			// Allow async operations to settle.
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( mockAddProductsToCart ).toHaveBeenCalledWith(
				'example.wordpress.com',
				'domain-and-plan',
				[ domainCartItem ]
			);
			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/example.wordpress.com?redirect_to=' )
			);
		} );

		it( 'skips PLANS and redirects to checkout when the site has a 2-yearly plan', async () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: false, billing_period: '2 Years' },
			} );

			const domainCartItem = { product_slug: 'dotcom_domain' };

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				dependencies: {
					domainItem: domainCartItem,
					domainCart: [ domainCartItem ],
					signupDomainOrigin: 'free',
				},
				currentURL: '/domain-and-plan/domains?siteSlug=example.wordpress.com',
			} );

			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( mockAddProductsToCart ).toHaveBeenCalled();
			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/example.wordpress.com?redirect_to=' )
			);
		} );

		it( 'navigates to USE_MY_DOMAIN when navigateToUseMyDomain is true', () => {
			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.DOMAIN_SEARCH.slug,
				dependencies: {
					navigateToUseMyDomain: true,
				},
				currentURL: '/domain-and-plan/domains?siteSlug=example.wordpress.com',
			} );

			const location = getFlowLocation();
			expect( location.path ).toContain( 'use-my-domain' );
		} );
	} );

	describe( 'USE_MY_DOMAIN submit', () => {
		it( 'navigates to PLANS when the site has a free plan', () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: true, billing_period: '' },
			} );

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.USE_MY_DOMAIN.slug,
				dependencies: {},
				currentURL: '/domain-and-plan/use-my-domain?siteSlug=example.wordpress.com',
			} );

			const location = getFlowLocation();
			expect( location.path ).toContain( STEPS.PLANS.slug );
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );

		it( 'navigates to PLANS when the site has a monthly plan', () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: false, billing_period: 'Monthly' },
			} );

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.USE_MY_DOMAIN.slug,
				dependencies: {},
				currentURL: '/domain-and-plan/use-my-domain?siteSlug=example.wordpress.com',
			} );

			const location = getFlowLocation();
			expect( location.path ).toContain( STEPS.PLANS.slug );
			expect( window.location.assign ).not.toHaveBeenCalled();
		} );

		it( 'skips PLANS and redirects to checkout when the site has a qualifying yearly plan', async () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: false, billing_period: 'Yearly' },
			} );

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.USE_MY_DOMAIN.slug,
				dependencies: {},
				currentURL: '/domain-and-plan/use-my-domain?siteSlug=example.wordpress.com',
			} );

			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/example.wordpress.com?redirect_to=' )
			);
		} );

		it( 'skips PLANS and redirects to checkout when the site has a 2-yearly plan', async () => {
			mockUseSite.mockReturnValue( {
				plan: { is_free: false, billing_period: '2 Years' },
			} );

			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.USE_MY_DOMAIN.slug,
				dependencies: {},
				currentURL: '/domain-and-plan/use-my-domain?siteSlug=example.wordpress.com',
			} );

			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/example.wordpress.com?redirect_to=' )
			);
		} );

		it( 'navigates to a sub-step when mode and domain are provided', () => {
			const { runUseStepNavigationSubmit } = renderFlow( domainAndPlanFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.USE_MY_DOMAIN.slug,
				dependencies: {
					mode: 'transfer',
					domain: 'mydomain.com',
				},
				currentURL: '/domain-and-plan/use-my-domain?siteSlug=example.wordpress.com',
			} );

			const location = getFlowLocation();
			expect( location.path ).toContain( 'use-my-domain' );
			expect( location.path ).toContain( 'step=transfer' );
		} );
	} );
} );
