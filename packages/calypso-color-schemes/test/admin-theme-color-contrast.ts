/**
 * @jest-environment node
 */
import fs from 'fs';
import chroma from 'chroma-js';
import { getAdminSchemes } from '../bin/prepare-sass-assets';

const MIN_RATIO = 4.5;

const getSchemes = (): Record< string, string > =>
	getAdminSchemes(
		fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
	);

const contrast = ( name: string ) => chroma.contrast( getSchemes()[ name ], '#fff' );

describe( 'admin theme colour contrast', () => {
	// The remediation goes in the failure message rather than a comment: this fires on a Renovate bump of @wordpress/base-styles, and whoever picks that up has none of the context from the PR that added it.
	it( 'meets AA against white text for every scheme', () => {
		const failures = Object.keys( getSchemes() )
			.filter( ( name ) => contrast( name ) < MIN_RATIO )
			.map(
				( name ) =>
					`${ name }: ${ contrast( name ).toFixed(
						2
					) }:1 against white, below AA. Core moved this scheme the wrong way — raise it upstream.`
			);

		expect( failures ).toEqual( [] );
	} );
} );
