#!/usr/bin/env node

/* eslint-disable import/no-nodejs-modules,no-console */

// find all the packages
const path = require( 'path' );
const { execSync } = require( 'child_process' );

const dir = process.cwd();
const root = path.dirname( __dirname );
const babelPresetFile = path.join( root, 'babel', 'default.js' );

const inputDir = path.join( dir, 'src' );
const outputDirEsm = path.join( dir, 'dist', 'esm' );
const outputDirCommon = path.join( dir, 'dist', 'cjs' );

// If the pattern was just a relative path (**/test/**), Babel would resolve it against the
// root directory (set as cwd) which isn't an ancestor of any of the source files.
const testIgnorePattern = path.join( dir, '**/test/**' );

console.log( 'Building %s', dir );
const baseCommand = `npx --no-install babel --presets="${ babelPresetFile }" --ignore "${ testIgnorePattern }" --extensions='.js,.jsx,.ts,.tsx'`;

execSync( `${ baseCommand } -d "${ outputDirEsm }" "${ inputDir }"`, {
	env: Object.assign( {}, process.env, { BROWSERSLIST_ENV: 'defaults' } ),
	cwd: root,
} );

execSync( `${ baseCommand } -d "${ outputDirCommon }" "${ inputDir }"`, {
	env: Object.assign( {}, process.env, { BROWSERSLIST_ENV: 'defaults', MODULES: 'commonjs' } ),
	cwd: root,
} );
