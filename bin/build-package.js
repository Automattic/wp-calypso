/** @format */

// find all the packages
const { execSync } = require( 'child_process' );
const path = require( 'path' );

const dir = process.cwd();
const root = path.resolve( __dirname, '..' );
const inputDir = path.relative( root, path.join( dir, 'src' ) );
const outputDirEsm = path.relative( root, path.join( dir, 'dist', 'esm' ) );
const outputDirCommon = path.relative( root, path.join( dir, 'dist', 'cjs' ) );
console.log( `Building ${ dir }...` );
execSync( `node_modules/.bin/babel -d ${ outputDirEsm } ${ inputDir }`, {
	env: Object.assign( {}, process.env, { CALYPSO_CLIENT: 'true' } ),
	cwd: root,
} );
execSync( `node_modules/.bin/babel -d ${ outputDirCommon } ${ inputDir }`, {
	env: Object.assign( {}, process.env, { CALYPSO_CLIENT: 'false' } ),
	cwd: root,
} );
