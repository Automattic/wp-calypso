/**
 * @jest-environment node
 */

import fs from 'fs';
import path from 'path';

const rootDir = path.resolve( __dirname, '..', '..', '..', '..' );

// `theme_color` tints the browser UI directly above the omnibar, so the
// wpcom and Dashboard configs must use the omnibar's background color.
const OMNIBAR_CONFIGS = [
	'development',
	'horizon',
	'production',
	'stage',
	'test',
	'wpcalypso',
	'dashboard-development',
	'dashboard-horizon',
	'dashboard-production',
	'dashboard-stage',
];

function readScssColor( file, pattern ) {
	const source = fs.readFileSync( path.join( rootDir, file ), 'utf8' );
	const match = source.match( pattern );
	if ( ! match ) {
		throw new Error( `Could not find ${ pattern } in ${ file }` );
	}
	return match[ 1 ].toLowerCase();
}

function readConfig( name ) {
	return JSON.parse( fs.readFileSync( path.join( rootDir, 'config', `${ name }.json` ), 'utf8' ) );
}

function readThemeColor( name ) {
	const config = { ...readConfig( '_shared' ), ...readConfig( name ) };
	return config.theme_color?.toLowerCase();
}

describe( 'theme_color config', () => {
	const omnibarColor = readScssColor(
		'packages/omnibar/src/components/_variables.scss',
		/\$omnibar-base-color:\s*(#[0-9a-f]{3,8})\s*;/i
	);
	const globalMasterbarColor = readScssColor(
		'packages/calypso-color-schemes/src/shared/color-schemes/_global.scss',
		/--theme-base-color:\s*(#[0-9a-f]{3,8})\s*;/i
	);

	test( 'the omnibar and the global color scheme masterbar use the same color', () => {
		expect( globalMasterbarColor ).toBe( omnibarColor );
	} );

	test.each( OMNIBAR_CONFIGS )( '%s matches the omnibar background', ( name ) => {
		expect( readThemeColor( name ) ).toBe( omnibarColor );
	} );
} );
