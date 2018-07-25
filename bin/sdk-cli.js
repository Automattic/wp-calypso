#!/usr/bin/env node

/** @format */

const chalk = require( 'chalk' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;

const buildBlockScript = path.resolve( __dirname, 'create-scripts/block.js' );
const [ /* node */, /* bin/sdk-cli.js */, task, ...args ] = process.argv;

if ( ! args.length || task !== 'build-block' ) {
	console.log( chalk.red( 'usage: npx calypso-gutenberg-sdk build-block <block>' ) );
	process.exit(1);
}

spawnSync( 'node', [ buildBlockScript, ...args ], {
	env: {
		SKIP_FLAG_IMAGES: true,
	},
	shell: true,
	stdio: 'inherit',
} );
