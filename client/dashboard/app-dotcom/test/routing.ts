import { buildDotcomDashboardLink } from '../routing';

jest.mock( '@automattic/calypso-config', () => {
	const config = ( key: string ) => {
		const values: Record< string, string > = { env: 'production' };
		return values[ key ];
	};
	config.isEnabled = () => false;
	return { __esModule: true, default: config };
} );

describe( 'buildDotcomDashboardLink', () => {
	test( 'should build a URL with the dotcom origin', () => {
		expect( buildDotcomDashboardLink( '/sites' ) ).toBe( 'https://my.wordpress.com/sites' );
	} );

	test( 'should reject protocol-relative paths', () => {
		expect( buildDotcomDashboardLink( '//evil.com' ) ).toBe( 'https://my.wordpress.com/evil.com' );
	} );

	test( 'should reject multiple leading slashes', () => {
		expect( buildDotcomDashboardLink( '///evil.com' ) ).toBe( 'https://my.wordpress.com/evil.com' );
	} );

	test( 'should handle empty path', () => {
		expect( buildDotcomDashboardLink() ).toBe( 'https://my.wordpress.com/' );
	} );

	test( 'should preserve valid paths with query params', () => {
		expect( buildDotcomDashboardLink( '/sites?foo=bar' ) ).toBe(
			'https://my.wordpress.com/sites?foo=bar'
		);
	} );
} );
