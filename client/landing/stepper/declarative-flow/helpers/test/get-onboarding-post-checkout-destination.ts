/**
 * @jest-environment jsdom
 */
import { getOnboardingPostCheckoutDestination } from '../get-onboarding-post-checkout-destination';

describe( 'getOnboardingPostCheckoutDestination', () => {
	const mockParams = {
		flowName: 'onboarding',
		locale: 'en',
		siteSlug: 'example.wordpress.com',
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'when shouldRedirectToMultiSiteDashboard is true', () => {
		it( 'should return dashboard destination with correct query args', () => {
			const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: true,
			} );

			expect( destination ).toBe(
				'http://my.localhost:3000/sites/example.wordpress.com?ref=onboarding'
			);
			expect( backUrl ).toBe( '/setup/onboarding/plans?siteSlug=example.wordpress.com' );
		} );

		it( 'should handle different site slugs', () => {
			const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: true,
				siteSlug: 'test-site.wordpress.com',
			} );

			expect( destination ).toContain( 'test-site.wordpress.com' );
			expect( backUrl ).toContain( 'siteSlug=test-site.wordpress.com' );
		} );

		it( 'should handle different flow names', () => {
			const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: true,
				flowName: 'custom-flow',
			} );

			expect( destination ).toContain( 'ref=custom-flow' );
			expect( backUrl ).toContain( '/setup/custom-flow/plans' );
		} );

		it( 'should handle different locales', () => {
			const [ , backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: true,
				locale: 'fr',
			} );

			expect( backUrl ).toContain( '/setup/onboarding/plans/fr' );
		} );
	} );

	describe( 'when shouldRedirectToMultiSiteDashboard is false', () => {
		it( 'should return home destination with correct query args', () => {
			const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: false,
			} );

			expect( destination ).toBe( '/home/example.wordpress.com?ref=onboarding' );
			expect( backUrl ).toBe( '/setup/onboarding/plans?siteSlug=example.wordpress.com' );
		} );

		it( 'should handle different site slugs', () => {
			const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: false,
				siteSlug: 'another-site.wordpress.com',
			} );

			expect( destination ).toContain( 'another-site.wordpress.com' );
			expect( backUrl ).toContain( 'siteSlug=another-site.wordpress.com' );
		} );

		it( 'should handle different flow names', () => {
			const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: false,
				flowName: 'test-flow',
			} );

			expect( destination ).toContain( 'ref=test-flow' );
			expect( backUrl ).toContain( '/setup/test-flow/plans' );
		} );

		it( 'should handle different locales', () => {
			const [ , backUrl ] = getOnboardingPostCheckoutDestination( {
				...mockParams,
				shouldRedirectToMultiSiteDashboard: false,
				locale: 'es',
			} );

			expect( backUrl ).toContain( '/setup/onboarding/plans/es' );
		} );
	} );
} );
