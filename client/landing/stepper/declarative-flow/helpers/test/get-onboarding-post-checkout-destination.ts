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
		const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( mockParams );

		expect( destination ).toBe( '/home/example.wordpress.com?ref=onboarding' );
		expect( backUrl ).toBe( '/setup/onboarding/plans?siteSlug=example.wordpress.com' );
	} );

	it( 'should handle different site slugs', () => {
		const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
			...mockParams,
			siteSlug: 'another-site.wordpress.com',
		} );

		expect( destination ).toContain( 'another-site.wordpress.com' );
		expect( backUrl ).toContain( 'siteSlug=another-site.wordpress.com' );
	} );

	it( 'should handle different flow names', () => {
		const [ destination, backUrl ] = getOnboardingPostCheckoutDestination( {
			...mockParams,
			flowName: 'test-flow',
		} );

		expect( destination ).toContain( 'ref=test-flow' );
		expect( backUrl ).toContain( '/setup/test-flow/plans' );
	} );

	it( 'should handle different locales', () => {
		const [ , backUrl ] = getOnboardingPostCheckoutDestination( {
			...mockParams,
			locale: 'es',
		} );

		expect( backUrl ).toContain( '/setup/onboarding/plans/es' );
	} );
} );
