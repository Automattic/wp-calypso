/**
 * @jest-environment node
 */
import fs from 'fs';
import chroma from 'chroma-js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAdminSchemes } = require( '../bin/prepare-sass-assets' );

const MIN_RATIO = 4.5;

// Schemes whose upstream value is still below AA. Core has been re-tuning these, so entries come off the list as @wordpress/base-styles is bumped — and are never added to it without discussion. At base-styles 12.1.0 all four pass and the list empties, at which point delete the second test below: it exists only to police this list, so with nothing in it, it asserts nothing.
const KNOWN_BELOW_AA = [ 'light', 'midnight', 'ocean', 'sunrise' ];

const getSchemes = (): Record< string, string > =>
	getAdminSchemes(
		fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
	);

const contrast = ( name: string ) => chroma.contrast( getSchemes()[ name ], '#fff' );

describe( 'admin theme colour contrast', () => {
	// Both remediations go in the compared values rather than in comments: these fire on a Renovate bump of @wordpress/base-styles, and whoever picks that up has none of the context from the PR that added them.
	it( 'meets AA against white text for every scheme except known exceptions', () => {
		const failures = Object.keys( getSchemes() )
			.filter( ( name ) => ! KNOWN_BELOW_AA.includes( name ) )
			.filter( ( name ) => contrast( name ) < MIN_RATIO )
			.map(
				( name ) =>
					`${ name }: ${ contrast( name ).toFixed(
						2
					) }:1 against white, below AA. Core moved this scheme the wrong way — raise it upstream rather than adding it to KNOWN_BELOW_AA, which is for values that were already short when this landed.`
			);

		expect( failures ).toEqual( [] );
	} );

	it( 'still lists only schemes that genuinely fall short', () => {
		const nowPassing = KNOWN_BELOW_AA.filter( ( name ) => contrast( name ) >= MIN_RATIO ).map(
			( name ) =>
				`${ name }: ${ contrast( name ).toFixed(
					2
				) }:1 against white, upstream now meets AA. Remove it from KNOWN_BELOW_AA — and if that empties the list, delete this test.`
		);

		expect( nowPassing ).toEqual( [] );
	} );
} );
