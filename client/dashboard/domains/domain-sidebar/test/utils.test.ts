import { getBackToSitePath } from '../utils';

describe( 'getBackToSitePath', () => {
	test( 'returns the site domains page when opened from it', () => {
		expect( getBackToSitePath( 'site-domains', 'example.com' ) ).toBe(
			'/sites/example.com/domains'
		);
	} );

	test( 'returns the site overview when opened from it', () => {
		expect( getBackToSitePath( 'site-overview', 'example.com' ) ).toBe( '/sites/example.com' );
	} );

	test( 'returns null when the domain was not opened from a site', () => {
		expect( getBackToSitePath( undefined, 'example.com' ) ).toBeNull();
		expect( getBackToSitePath( 'site-settings-sftp-ssh', 'example.com' ) ).toBeNull();
	} );
} );
