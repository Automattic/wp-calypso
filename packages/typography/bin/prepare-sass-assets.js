const { basename, dirname, join } = require( 'path' );
const { copyFileSync, existsSync, mkdirSync } = require( 'fs' );

//copyAsset( '@automattic/typography/dist/typography.css' );

function copyAsset( assetPath, targetName ) {
	if ( ! targetName ) {
		targetName = basename( assetPath );
	}

	const target = join( __dirname, '..', 'src', '__typography', targetName );

	if ( ! existsSync( dirname( target ) ) ) {
		mkdirSync( dirname( target ), { recursive: true } );
	}

	copyFileSync( require.resolve( assetPath ), join( target ) );
}
