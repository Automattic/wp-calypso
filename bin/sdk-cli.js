#!/usr/bin/env node

/** @format */

const chalk = require( 'chalk' );
const execSync = require( 'child_process' ).execSync;
const path = require( 'path' );

const buildBlockScript = path.resolve( __dirname, 'create-scripts/block.js' );
let args = process.argv;

// Remove `node` and SDK script
args.splice(0, 2);

// First argument should always be the task name
const task = args.shift();

if ( ! args.length || task !== 'build-block' ) {
	console.log( chalk.red( 'usage: npx calypso-gutenberg-sdk build-block <block>' ) );
	process.exit(1);
}

execSync( `cross-env-shell SKIP_FLAG_IMAGES=true node ${ buildBlockScript } ${ args.join( ' ' ) }`, {
	shell: true,
	stdio: 'inherit',
} );
