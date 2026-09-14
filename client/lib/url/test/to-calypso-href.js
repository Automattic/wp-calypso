/**
 * @jest-environment jsdom
 */
jest.mock( '@automattic/calypso-config', () => {
	const configApi = () => '';
	configApi.isEnabled = jest.fn( () => false );
	return configApi;
} );

import config from '@automattic/calypso-config';
import toCalypsoHref from '../to-calypso-href';

const enableOdyssey = ( enabled ) =>
	config.isEnabled.mockImplementation( ( flag ) => flag === 'is_odyssey' && enabled );

describe( 'toCalypsoHref', () => {
	afterEach( () => {
		config.isEnabled.mockReset();
		config.isEnabled.mockReturnValue( false );
	} );

	test( 'absolutizes a root-relative Calypso route in wp-admin (Odyssey)', () => {
		enableOdyssey( true );
		expect( toCalypsoHref( '/post/example.com' ) ).toBe( 'https://wordpress.com/post/example.com' );
		expect( toCalypsoHref( '/plans/example.com?feature=advanced-seo&plan=business-bundle' ) ).toBe(
			'https://wordpress.com/plans/example.com?feature=advanced-seo&plan=business-bundle'
		);
	} );

	test( 'leaves absolute and protocol-relative URLs untouched in Odyssey', () => {
		enableOdyssey( true );
		expect( toCalypsoHref( 'https://example.com/wp-admin/upload.php' ) ).toBe(
			'https://example.com/wp-admin/upload.php'
		);
		expect( toCalypsoHref( '//example.com/path' ) ).toBe( '//example.com/path' );
		expect( toCalypsoHref( 'admin.php?page=stats' ) ).toBe( 'admin.php?page=stats' );
	} );

	test( 'passes empty values through in Odyssey', () => {
		enableOdyssey( true );
		expect( toCalypsoHref( undefined ) ).toBeUndefined();
		expect( toCalypsoHref( null ) ).toBeNull();
	} );

	test( 'is a no-op outside wp-admin', () => {
		enableOdyssey( false );
		expect( toCalypsoHref( '/post/example.com' ) ).toBe( '/post/example.com' );
	} );
} );
