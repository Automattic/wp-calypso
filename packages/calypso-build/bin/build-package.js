#!/usr/bin/env node

/* eslint-disable import/no-nodejs-modules,no-console */

// find all the packages
const path = require( 'path' );
const { execSync } = require( 'child_process' );

const dir = process.cwd();
const root = path.dirname( __dirname );
const babelConfigFile = path.join( root, '..', '..', 'babel.config.js' );

const inputDir = path.join( dir, 'src' );
const outputDirEsm = path.join( dir, 'dist', 'esm' );
const outputDirCommon = path.join( dir, 'dist', 'cjs' );

console.log( 'Building %s', dir );

// TODO: Drop `--config-file ${ babelConfigFile }` once we've moved `babel.config.js` to `packages/calypso-build`.
execSync( `npx babel --config-file ${ babelConfigFile } -d ${ outputDirEsm } ${ inputDir }`, {
	env: Object.assign( {}, process.env, { CALYPSO_CLIENT: 'true' } ),
	cwd: root,
} );

// TODO: Drop `--config-file ${ babelConfigFile }` once we've moved `babel.config.js` to `packages/calypso-build`.
execSync( `npx babel --config-file ${ babelConfigFile } -d ${ outputDirCommon } ${ inputDir }`, {
	env: Object.assign( {}, process.env, { CALYPSO_CLIENT: 'false' } ),
	cwd: root,
} );
