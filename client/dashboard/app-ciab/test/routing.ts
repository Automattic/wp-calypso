import { buildCiabDashboardLink } from '../routing';

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		const values: Record< string, string > = { env: 'production' };
		return values[ key ];
	};
	config.isEnabled = () => false;
	return { __esModule: true, default: config };
} );

describe( 'buildCiabDashboardLink', () => {
	test( 'should build a URL with the CIAB origin', () => {
		expect( buildCiabDashboardLink( '/sites' ) ).toBe( 'https://my.woo.ai/sites' );
	} );

	test( 'should reject protocol-relative paths', () => {
		expect( buildCiabDashboardLink( '//evil.com' ) ).toBe( 'https://my.woo.ai/evil.com' );
	} );

	test( 'should reject multiple leading slashes', () => {
		expect( buildCiabDashboardLink( '///evil.com' ) ).toBe( 'https://my.woo.ai/evil.com' );
	} );

	test( 'should handle empty path', () => {
		expect( buildCiabDashboardLink() ).toBe( 'https://my.woo.ai/' );
	} );

	test( 'should preserve valid paths', () => {
		expect( buildCiabDashboardLink( '/checkout/site.com' ) ).toBe(
			'https://my.woo.ai/checkout/site.com'
		);
	} );
} );
