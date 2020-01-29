/**
 * Internal dependencies
 */
import { getThankYouPageUrl } from '../composite-checkout-thank-you';

describe( 'getThankYouPageUrl', () => {
	it( 'returns no-site thank-you page with no arguments', () => {
		const url = getThankYouPageUrl();
		expect( url ).toBe( '/checkout/thank-you/no-site' );
	} );

	it( 'returns site id thank-you page with siteId', () => {
		const url = getThankYouPageUrl( { siteId: 45023 } );
		expect( url ).toBe( '/checkout/thank-you/45023' );
	} );
} );
