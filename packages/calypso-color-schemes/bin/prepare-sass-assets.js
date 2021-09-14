/* eslint-disable import/no-nodejs-modules */
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { createRequire } from 'module';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );

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

	const source = createRequire( import.meta.url ).resolve( assetPath );
	copyFileSync( source, target );
}
