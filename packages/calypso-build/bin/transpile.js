#!/usr/bin/env node

// find all the packages
const { execSync } = require( 'child_process' );
const path = require( 'path' );

const dir = process.cwd();
const root = path.dirname( __dirname );
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

console.log( 'Building %s', dir );

// For yarn to find the babel bin script, @babel/cli must be in caplyso-build's dependencies.
const baseCommand = `yarn run babel ${ inputDir } --presets="${ babelPresetFile }" --ignore "${ testIgnorePattern }" --extensions='.js,.jsx,.ts,.tsx'`;

const execConfig = {
	encoding: 'UTF-8', // So that errors are human-readable.
	cwd: root,
};

if ( transpileAll || transpileESM ) {
	execSync( `${ baseCommand } -d "${ outputDirESM }"`, execConfig );
}

if ( transpileAll || transpileCJS ) {
	execSync( `${ baseCommand } -d "${ outputDirCJS }"`, {
		...execConfig,
		env: { ...process.env, MODULES: 'commonjs' },
	} );
}
