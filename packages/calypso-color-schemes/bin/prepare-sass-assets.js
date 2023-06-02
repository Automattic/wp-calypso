/* eslint-disable import/no-nodejs-modules */
const { copyFileSync, existsSync, mkdirSync } = require( 'fs' );
const { basename, dirname, join } = require( 'path' );

copyAsset( '@automattic/color-studio/dist/color-properties.css' );
copyAsset( '@automattic/color-studio/dist/color-properties-rgb.css' );

function copyAsset( assetPath, targetName ) {
	if ( ! targetName ) {
		targetName = basename( assetPath );
	}

	const target = join( __dirname, '..', 'src', '__color-studio', targetName );

	if ( ! existsSync( dirname( target ) ) ) {
		mkdirSync( dirname( target ), { recursive: true } );
	}

	copyFileSync( require.resolve( assetPath ), join( target ) );
}
