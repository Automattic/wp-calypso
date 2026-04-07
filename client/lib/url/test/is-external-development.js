/**
 * @jest-environment jsdom
 */

// Mock config before importing isExternal to simulate the development environment.
jest.mock( '@automattic/calypso-config', () => {
	const configMock = ( key ) => {
		const values = { env_id: 'development', hostname: 'calypso.localhost' };
		return values[ key ];
	};
	return { __esModule: true, default: configMock };
} );

import isExternal from '../is-external';

describe( 'isExternal on development environment', () => {
	test( 'should return false for wordpress.com Calypso route', () => {
		expect( isExternal( 'https://wordpress.com/home/mysite' ) ).toBe( false );
	} );

	test( 'should return false for wordpress.com stats route', () => {
		expect( isExternal( 'https://wordpress.com/stats/day/mysite' ) ).toBe( false );
	} );

	test( 'should return true for wp-admin URLs on site domain', () => {
		expect( isExternal( 'https://mysite.wordpress.com/wp-admin/' ) ).toBe( true );
	} );

	test( 'should return true for unrelated external URLs', () => {
		expect( isExternal( 'https://some-other-site.com/' ) ).toBe( true );
	} );
} );
