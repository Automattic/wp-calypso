/**
 * @jest-environment node
 */
import { getSiteSetupUrl } from '../get-site-setup-url';

describe( 'getSiteSetupUrl', () => {
	it( 'builds the WooPayments connect URL on the site WP-Admin', () => {
		expect( getSiteSetupUrl( 'https://example.com' ) ).toBe(
			'https://example.com/wp-admin/admin.php?page=wc-admin&path=/payments/connect'
		);
	} );
} );
