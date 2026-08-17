/**
 * @jest-environment node
 */
import fs from 'fs';
import chroma from 'chroma-js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAdminSchemes } = require( '../bin/prepare-sass-assets' );

const MIN_RATIO = 4.5;

// Schemes whose upstream value is still below AA. Core has been re-tuning these, so entries should come off this list as base-styles is bumped — never be added to it without discussion.
const KNOWN_BELOW_AA = [ 'light', 'midnight', 'ocean', 'sunrise' ];

const getSchemes = (): Record< string, string > =>
	getAdminSchemes(
		fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
	);

const contrast = ( name: string ) => chroma.contrast( getSchemes()[ name ], '#fff' );

describe( 'admin theme colour contrast', () => {
	it( 'meets AA against white text for every scheme except known exceptions', () => {
		const failures = Object.keys( getSchemes() )
			.filter( ( name ) => ! KNOWN_BELOW_AA.includes( name ) )
			.filter( ( name ) => contrast( name ) < MIN_RATIO );

		expect( failures ).toEqual( [] );
	} );

	it( 'still lists only schemes that genuinely fall short', () => {
		// The remediation goes in the compared value, not a comment: this fires on a Renovate bump of @wordpress/base-styles, and whoever picks that up has none of the context from this PR.
		const nowPassing = KNOWN_BELOW_AA.filter( ( name ) => contrast( name ) >= MIN_RATIO ).map(
			( name ) => `${ name }: upstream now meets AA — remove it from KNOWN_BELOW_AA`
		);

		expect( nowPassing ).toEqual( [] );
	} );

	it( 'improves coffee the most, the largest gain this change delivers', () => {
		// Calypso's decorative accent for coffee is 2.29:1 against white — unreadable, and the regression that started this work. Core's interactive colour for the same scheme is ~10:1.
		expect( contrast( 'coffee' ) ).toBeGreaterThan( 9 );
	} );
} );
