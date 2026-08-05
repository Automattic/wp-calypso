/**
 * @jest-environment node
 */
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseAdminSchemes } = require( '../bin/prepare-sass-assets' );

const EXPECTED_SCHEMES = [
	'blue',
	'coffee',
	'ectoplasm',
	'light',
	'midnight',
	'modern',
	'ocean',
	'sunrise',
];

describe( 'parseAdminSchemes', () => {
	it( 'extracts every admin scheme colour from the upstream mixin', () => {
		const source = fs.readFileSync(
			require.resolve( '@wordpress/base-styles/_mixins.scss' ),
			'utf8'
		);
		const schemes = parseAdminSchemes( source );

		expect( Object.keys( schemes ).sort() ).toEqual( EXPECTED_SCHEMES );
		Object.values( schemes ).forEach( ( hex ) => {
			expect( hex ).toMatch( /^#[0-9a-f]{6}$/i );
		} );
	} );

	it( 'throws when the upstream mixin cannot be found', () => {
		expect( () => parseAdminSchemes( '// nothing here' ) ).toThrow( /wordpress-admin-schemes/ );
	} );

	it( 'throws when upstream drops a scheme we rely on', () => {
		// Closing braces are at column 0 to mirror the real file — parseAdminSchemes
		// relies on that to tell the mixin's own closing brace from its inner ones.
		const truncated = `@mixin wordpress-admin-schemes() {
	body.admin-color-coffee {
		@include admin-scheme(#46403c);
	}
}`;
		expect( () => parseAdminSchemes( truncated ) ).toThrow( /blue/ );
	} );
} );
