/* eslint-disable import/no-nodejs-modules */
const { dirname, join } = require( 'path' );
const { copyFileSync, existsSync, mkdirSync } = require( 'fs' );

const srcFile = 'color-variables.scss';
const target = join( __dirname, '..', 'src', '__color-studio', srcFile );

if ( ! existsSync( dirname( target ) ) ) {
	mkdirSync( dirname( target ), { recursive: true } );
}

copyFileSync( require.resolve( 'color-studio/dist/' + srcFile ), join( target ) );
