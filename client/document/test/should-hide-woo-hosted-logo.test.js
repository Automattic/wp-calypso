import { shouldHideWooHostedLogo } from '../utils/should-hide-woo-hosted-logo';

describe( 'shouldHideWooHostedLogo', () => {
	it( 'returns true for Woo Hosted setup flow', () => {
		expect(
			shouldHideWooHostedLogo(
				'/setup/woo-hosted-plans/plans?siteSlug=unabashedly-instant-starlight.commerce-garden.com'
			)
		).toBe( true );
	} );

	it( 'returns false for non-Woo setup flow', () => {
		expect( shouldHideWooHostedLogo( '/setup/onboarding/design-setup' ) ).toBe( false );
	} );

	it( 'returns true for Woo Hosted checkout slug', () => {
		expect( shouldHideWooHostedLogo( '/checkout/example.commerce-garden.com' ) ).toBe( true );
	} );

	it( 'returns true for Woo Hosted checkout plan slug', () => {
		expect(
			shouldHideWooHostedLogo( '/checkout/example.wordpress.com/woo_hosted_basic_plan_yearly' )
		).toBe( true );
	} );

	it( 'returns true for checkout cancel_to Woo Hosted flow', () => {
		expect(
			shouldHideWooHostedLogo(
				'/checkout/example.wordpress.com?cancel_to=%2Fsetup%2Fwoo-hosted-plans%2Fplans%3FsiteSlug%3Dexample.commerce-garden.com'
			)
		).toBe( true );
	} );

	it( 'returns false for non-Woo checkout route', () => {
		expect(
			shouldHideWooHostedLogo(
				'/checkout/example.wordpress.com?cancel_to=%2Fsetup%2Fonboarding%2Fplans'
			)
		).toBe( false );
	} );

	it( 'returns false for unknown route', () => {
		expect( shouldHideWooHostedLogo( '/reader' ) ).toBe( false );
	} );
} );
