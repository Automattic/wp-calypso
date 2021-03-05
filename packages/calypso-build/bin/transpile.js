#!/usr/bin/env node

/* eslint-disable import/no-nodejs-modules,no-console */

// find all the packages
const path = require( 'path' );
const { execSync } = require( 'child_process' );

const dir = process.cwd();
const root = path.dirname( __dirname );
const babelPresetFile = path.join( root, 'babel', 'default.js' );

const inputDir = path.join( dir, 'src' );
const outputDirESM = path.join( dir, 'dist', 'esm' );
const outputDirCJS = path.join( dir, 'dist', 'cjs' );

let transpileAll = true;
let transpileESM = false;
let transpileCJS = false;

for ( const arg of process.argv.slice( 2 ) ) {
	if ( arg === '--esm' ) {
		transpileAll = false;
		transpileESM = true;
	}

	if ( arg === '--cjs' ) {
		transpileAll = false;
		transpileCJS = true;
	}
}

// If the pattern was just a relative path (**/test/**), Babel would resolve it against the
// root directory (set as cwd) which isn't an ancestor of any of the source files.
const testIgnorePattern = path.join( dir, '**/test/**' );

console.log( 'Building %s', dir );
const baseCommand = `npx --no-install babel --presets="${ babelPresetFile }" --ignore "${ testIgnorePattern }" --extensions='.js,.jsx,.ts,.tsx'`;

if ( transpileAll || transpileESM ) {
	execSync( `${ baseCommand } -d "${ outputDirESM }" "${ inputDir }"`, {
		env: Object.assign( {}, process.env, { BROWSERSLIST_ENV: 'defaults' } ),
		cwd: root,
	} );
}

if ( transpileAll || transpileCJS ) {
	execSync( `${ baseCommand } -d "${ outputDirCJS }" "${ inputDir }"`, {
		env: Object.assign( {}, process.env, { BROWSERSLIST_ENV: 'defaults', MODULES: 'commonjs' } ),
		cwd: root,
	} );
}
