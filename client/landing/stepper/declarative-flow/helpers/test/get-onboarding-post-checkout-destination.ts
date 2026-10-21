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

	it( 'should return home destination with correct query args', () => {
		const [ destination, backUrl, backUrlDomains ] =
			getOnboardingPostCheckoutDestination( mockParams );

		expect( destination ).toBe( '/home/example.wordpress.com?ref=onboarding' );
		expect( backUrl ).toBe( '/setup/onboarding/plans?siteSlug=example.wordpress.com' );
		expect( backUrlDomains ).toBe( '/setup/onboarding/domains?siteSlug=example.wordpress.com' );
	} );

	it( 'should handle different site slugs', () => {
		const [ destination, backUrl, backUrlDomains ] = getOnboardingPostCheckoutDestination( {
			...mockParams,
			siteSlug: 'another-site.wordpress.com',
		} );

		expect( destination ).toContain( 'another-site.wordpress.com' );
		expect( backUrl ).toContain( 'siteSlug=another-site.wordpress.com' );
		expect( backUrlDomains ).toContain( 'siteSlug=another-site.wordpress.com' );
	} );

	it( 'should handle different flow names', () => {
		const [ destination, backUrl, backUrlDomains ] = getOnboardingPostCheckoutDestination( {
			...mockParams,
			flowName: 'test-flow',
		} );

		expect( destination ).toContain( 'ref=test-flow' );
		expect( backUrl ).toContain( '/setup/test-flow/plans' );
		expect( backUrlDomains ).toContain( '/setup/test-flow/domains' );
	} );

	it( 'should handle different locales', () => {
		const [ , backUrl, backUrlDomains ] = getOnboardingPostCheckoutDestination( {
			...mockParams,
			locale: 'es',
		} );

		expect( backUrl ).toContain( '/setup/onboarding/plans/es' );
		expect( backUrlDomains ).toContain( '/setup/onboarding/domains/es' );
	} );
} );
