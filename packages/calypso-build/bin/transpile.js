#!/usr/bin/env node

// find all the packages
const { execSync } = require( 'child_process' );
const path = require( 'path' );

const dir = process.cwd();
const babelPresetFile = require.resolve( '@automattic/calypso-babel-config/presets/default.js' );

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

// Babel may get hoisted from calypso-build/node_modules to the root-level node_modules.
// To handle either scenario, use require.resolve to find the path to babel.
const babelLocation = require.resolve( '@babel/cli' );
if ( ! babelLocation ) {
	throw new Error( 'Could not find babel CLI; there may be an issue with dependencies.' );
}
// The bin script lives at node_modules/.bin/babel, so this changes node_modules/@babel/cli/...
// to point to that instead. In theory, this would break if you install wp-calypso
// under a path which includes babel, like /home/foo/@babel/wp-calypso, but who
// would do that?
const babelScript = path.resolve( babelLocation.split( '@babel' )[ 0 ], '.bin', 'babel' );

// NOTE: this depends explicitly on @babel/cli, so @babel/cli must be included
// in calypso-build's dependencies.
const baseCommand = `${ babelScript } --presets="${ babelPresetFile }" --ignore "${ testIgnorePattern }" --extensions='.js,.jsx,.ts,.tsx'`;

console.log( 'Building %s', dir );

if ( transpileAll || transpileESM ) {
	execSync( `${ baseCommand } -d "${ outputDirESM }" "${ inputDir }"` );
}

if ( transpileAll || transpileCJS ) {
	execSync( `${ baseCommand } -d "${ outputDirCJS }" "${ inputDir }"`, {
		env: Object.assign( {}, process.env, { MODULES: 'commonjs' } ),
	} );
}
