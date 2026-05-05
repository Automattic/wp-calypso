( globalThis as Record< string, unknown > ).__i18n_text_domain__ = 'default';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

// eslint-disable-next-line import/order
import { getToolErrorCategory, isWpErrorShape } from './error-categories';

describe( 'isWpErrorShape', () => {
	it( 'accepts a WP_Error-shaped value', () => {
		expect( isWpErrorShape( { code: 'rai_filtered', message: 'blocked' } ) ).toBe( true );
		expect( isWpErrorShape( { code: 'x', message: 'y', data: { status: 500 } } ) ).toBe( true );
	} );

	it( 'rejects values without code or message', () => {
		expect( isWpErrorShape( { code: 'rai_filtered' } ) ).toBe( false );
		expect( isWpErrorShape( { message: 'blocked' } ) ).toBe( false );
		expect( isWpErrorShape( { code: 1, message: 'blocked' } ) ).toBe( false );
		expect( isWpErrorShape( null ) ).toBe( false );
		expect( isWpErrorShape( undefined ) ).toBe( false );
		expect( isWpErrorShape( 'just a string' ) ).toBe( false );
	} );
} );

describe( 'getToolErrorCategory', () => {
	it( 'maps known safety/copyright codes to warning notices', () => {
		const rai = getToolErrorCategory( 'rai_filtered' );
		expect( rai?.severity ).toBe( 'warning' );
		expect( rai?.errorType ).toBe( 'safety_filter' );

		const ip = getToolErrorCategory( 'ip_filtered' );
		expect( ip?.severity ).toBe( 'warning' );
		expect( ip?.errorType ).toBe( 'copyright_filter' );
	} );

	it( 'maps capability and config codes', () => {
		expect( getToolErrorCategory( 'video_upload_not_supported' )?.errorType ).toBe(
			'unsupported_capability'
		);
		expect( getToolErrorCategory( 'video_utils_not_implemented' )?.errorType ).toBe(
			'not_configured'
		);
		expect( getToolErrorCategory( 'auth_failed' )?.errorType ).toBe( 'not_configured' );
	} );

	it( 'maps timeout and generic generation failures', () => {
		expect( getToolErrorCategory( 'polling_timeout' )?.errorType ).toBe( 'timeout' );
		expect( getToolErrorCategory( 'operation_error' )?.errorType ).toBe( 'generation_failed' );
		expect( getToolErrorCategory( 'read_failed' )?.errorType ).toBe( 'generation_failed' );
		expect( getToolErrorCategory( 'invalid_tmp_path' )?.errorType ).toBe( 'generation_failed' );
		expect( getToolErrorCategory( 'upload_failed' )?.errorType ).toBe( 'generation_failed' );
	} );

	it( 'returns null for unknown / intentionally-skipped codes', () => {
		expect( getToolErrorCategory( 'cancelled' ) ).toBeNull();
		expect( getToolErrorCategory( 'empty_prompt' ) ).toBeNull();
		expect( getToolErrorCategory( 'invalid_aspect_ratio' ) ).toBeNull();
		expect( getToolErrorCategory( 'never_seen_before' ) ).toBeNull();
	} );
} );
