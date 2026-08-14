/**
 * @jest-environment node
 */
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseAdminSchemes, getAdminSchemes } = require( '../bin/prepare-sass-assets' );

// Pinned, not shape-matched: which colours ship is the substance of this package, and a shape
// assertion passes just as happily when every scheme comes back the same wrong hex. A base-styles
// bump that changes one of these should fail here and be read as news, not noise.
const EXPECTED_SCHEMES: Record< string, string > = {
	blue: '#096484',
	coffee: '#46403c',
	ectoplasm: '#523f6d',
	light: '#0085ba',
	midnight: '#e14d43',
	modern: '#3858e9',
	ocean: '#627c83',
	sunrise: '#dd823b',
};

describe( 'parseAdminSchemes', () => {
	it( 'extracts every admin scheme colour from the upstream mixin', () => {
		const source = fs.readFileSync(
			require.resolve( '@wordpress/base-styles/_mixins.scss' ),
			'utf8'
		);

		expect( parseAdminSchemes( source ) ).toEqual( EXPECTED_SCHEMES );
	} );

	it( 'adds fresh, which core publishes as a default rather than a scheme block', () => {
		const source = fs.readFileSync(
			require.resolve( '@wordpress/base-styles/_mixins.scss' ),
			'utf8'
		);

		expect( parseAdminSchemes( source ).fresh ).toBeUndefined();
		expect( getAdminSchemes( source ) ).toEqual( { ...EXPECTED_SCHEMES, fresh: '#3858e9' } );
	} );

	it( 'throws when the upstream mixin cannot be found', () => {
		expect( () => parseAdminSchemes( '// nothing here' ) ).toThrow( /wordpress-admin-schemes/ );
	} );

	it( 'throws when upstream drops a scheme we rely on, naming what it did find', () => {
		// The mixin's own closing brace is at column 0 while the inner one is tab-indented, mirroring
		// the real file — parseAdminSchemes relies on exactly that to tell the two apart.
		const truncated = `@mixin wordpress-admin-schemes() {
	body.admin-color-coffee {
		@include admin-scheme(#46403c);
	}
}`;
		expect( () => parseAdminSchemes( truncated ) ).toThrow( /but not: blue/ );
		expect( () => parseAdminSchemes( truncated ) ).toThrow( /extracted 1 scheme\(s\) \(coffee\)/ );
	} );

	it( 'reports a scheme it cannot read as not found, rather than claiming it was removed', () => {
		// Upstream putting anything between the selector and the `@include` defeats the `entry`
		// regex. The scheme is still there; the message has to say so, or the next reader opens
		// _mixins.scss, sees `body.admin-color-coffee`, and distrusts the whole check.
		const reordered = `@mixin wordpress-admin-schemes() {
	body.admin-color-coffee {
		$scheme: coffee;
		@include admin-scheme(#46403c);
	}
}`;
		expect( () => parseAdminSchemes( reordered ) ).toThrow( /extracted 0 scheme\(s\) \(none\)/ );
		expect( () => parseAdminSchemes( reordered ) ).toThrow( /no longer match the/ );
	} );
} );
