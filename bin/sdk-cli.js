#!/usr/bin/env node

/** @format */

const chalk = require( 'chalk' );
const execSync = require( 'child_process' ).execSync;
const path = require( 'path' );

const buildBlockScript = path.resolve( __dirname, 'create-scripts/block.js' );
const crossEnvShell = path.resolve( __dirname, '../node_modules/.bin/cross-env-shell' );
const [ /* node */, /* bin/sdk-cli.js */, task, ...args ] = process.argv;

if ( ! args.length || task !== 'build-block' ) {
	console.log( chalk.red( 'usage: npx calypso-gutenberg-sdk build-block <block>' ) );
	process.exit(1);
}

execSync( `${ crossEnvShell } SKIP_FLAG_IMAGES=true node ${ buildBlockScript } ${ args.join( ' ' ) }`, {
	shell: true,
	stdio: 'inherit',
} );
