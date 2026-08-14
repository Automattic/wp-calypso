/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getAdminSchemes } = require( '../bin/prepare-sass-assets' );

const REPO_ROOT = path.join( __dirname, '..', '..', '..' );

// Odyssey's mirror of the scheme list. It hands `--wp-admin-theme-color` back to wp-admin for the
// schemes wp-admin ships; this package supplies a value for the same set in Calypso. The two are
// written independently and neither imports the other.
const ODYSSEY_HANDBACK = 'apps/odyssey-stats/src/styles/_admin-theme-handback.scss';

const read = ( file: string ) => fs.readFileSync( path.join( REPO_ROOT, file ), 'utf8' );

const odysseySchemes = (): string[] => {
	const list = read( ODYSSEY_HANDBACK ).match( /\$wp-admin-schemes:\s*([^;]*);/ );

	if ( ! list ) {
		throw new Error( `Could not find $wp-admin-schemes in ${ ODYSSEY_HANDBACK }.` );
	}

	return [ ...list[ 1 ].matchAll( /"([a-z-]+)"/g ) ].map( ( m ) => m[ 1 ] ).sort();
};

const calypsoSchemes = (): string[] =>
	Object.keys(
		getAdminSchemes(
			fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
		)
	).sort();

describe( 'admin theme colour parity with Odyssey', () => {
	it( 'covers exactly the schemes Odyssey hands back to wp-admin', () => {
		// The two environments have to agree on which schemes get core's interactive colour. Odyssey
		// takes it from wp-admin, Calypso from this package, and the lists are maintained separately —
		// so a scheme in one and not the other means Stats looks different in wp-admin than it does
		// on WordPress.com. That is exactly how `fresh`, the default scheme, came to be missing here
		// while Odyssey had it all along.
		//
		// This compares names only. The *values* can still drift, because Odyssey resolves them at
		// runtime from whatever WordPress ships while this package bakes them at build time from the
		// pinned @wordpress/base-styles. A bump moves Calypso ahead of wp-admin; a WordPress release
		// moves wp-admin ahead of Calypso. admin-theme-color-contrast.ts fires on the former.
		expect( calypsoSchemes() ).toEqual( odysseySchemes() );
	} );
} );
