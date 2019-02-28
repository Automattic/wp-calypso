/** @format */

// find all the packages
const fs = require( 'fs' );
const path = require( 'path' );
const { execSync } = require( 'child_process' );

const dir = process.cwd();
const root = path.dirname( __dirname, '..' );

const inputDir = path.join( dir, 'src' );
const outputDirEsm = path.join( dir, 'dist', 'esm' );
const outputDirCommon = path.join( dir, 'dist', 'cjs' );
if ( fs.existsSync( inputDir ) ) {
	console.log( 'Building %s', dir );
	execSync( `node_modules/.bin/babel -d ${ outputDirEsm } ${ inputDir }`, {
		env: Object.assign( {}, process.env, { CALYPSO_CLIENT: 'true' } ),
		cwd: root,
	} );
	execSync( `node_modules/.bin/babel -d ${ outputDirCommon } ${ inputDir }`, {
		env: Object.assign( {}, process.env, { CALYPSO_CLIENT: 'false' } ),
		cwd: root,
	} );
} else {
	console.log( 'Skipping %s (no src directory)', dir );
}

console.log( 'Done building package' );
