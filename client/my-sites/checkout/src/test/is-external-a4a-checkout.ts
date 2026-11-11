import { isExternalA4ACheckout } from '../lib/is-external-a4a-checkout';

describe( 'isExternalA4ACheckout', () => {
	it( 'keeps the pending page on the agency dashboard, which serves the checkout itself', () => {
		expect( isExternalA4ACheckout( 'a4a', 'agencies-beta.automattic.com' ) ).toBe( false );
		expect( isExternalA4ACheckout( 'a4a', 'my.a4a.localhost' ) ).toBe( false );
		expect( isExternalA4ACheckout( 'a4a', 'abc123-a4a.calypso.live' ) ).toBe( false );
	} );

	it( 'sends the other Automattic for Agencies checkouts to WordPress.com', () => {
		expect( isExternalA4ACheckout( 'a4a', 'agencies.automattic.com' ) ).toBe( true );
		expect( isExternalA4ACheckout( 'a4a', 'wordpress.com' ) ).toBe( true );
	} );

	it( 'leaves every other checkout alone', () => {
		expect( isExternalA4ACheckout( 'jetpack', 'agencies-beta.automattic.com' ) ).toBe( false );
		expect( isExternalA4ACheckout( undefined, 'wordpress.com' ) ).toBe( false );
	} );
} );
