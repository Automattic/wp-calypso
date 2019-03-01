/* eslint-disable import/no-nodejs-modules */
const fs = require( 'fs' );
const path = require( 'path' );

const srcFile = 'color-variables.scss';
const targetDir = path.join( __dirname, '..', 'src', '__color-studio' );

if ( ! fs.existsSync( targetDir ) ) {
	fs.mkdirSync( targetDir );
}

fs.copyFileSync(
	require.resolve( 'color-studio/dist/' + srcFile ),
	path.join( targetDir, srcFile )
);
