/**
 * @jest-environment node
 */
import fs from 'fs';
import chroma from 'chroma-js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseAdminSchemes } = require( '../bin/prepare-sass-assets' );

const MIN_RATIO = 4.5;

// Schemes whose upstream value is still below AA. Core has been re-tuning these
// (current Gutenberg trunk already uses accessible values), so entries should be
// removed here as base-styles is bumped — never added to without discussion.
const KNOWN_BELOW_AA = [ 'light', 'midnight', 'ocean', 'sunrise' ];

const getSchemes = (): Record< string, string > =>
	parseAdminSchemes(
		fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
	);

describe( 'admin theme colour contrast', () => {
	it( 'meets AA against white text for every scheme except known exceptions', () => {
		const failures = Object.entries( getSchemes() )
			.filter( ( [ name ] ) => ! KNOWN_BELOW_AA.includes( name ) )
			.map( ( [ name, hex ] ) => [ name, chroma.contrast( hex, '#fff' ) ] as const )
			.filter( ( [ , ratio ] ) => ratio < MIN_RATIO );

		expect( failures ).toEqual( [] );
	} );

	it( 'still lists only schemes that genuinely fall short', () => {
		const stillFailing = KNOWN_BELOW_AA.filter(
			( name ) => chroma.contrast( getSchemes()[ name ], '#fff' ) < MIN_RATIO
		);

		expect( stillFailing ).toEqual( KNOWN_BELOW_AA );
	} );

	it( 'improves coffee, the worst regression this fixes', () => {
		expect( chroma.contrast( getSchemes().coffee, '#fff' ) ).toBeGreaterThan( 9 );
	} );
} );
