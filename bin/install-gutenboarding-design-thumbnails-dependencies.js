#!/usr/bin/env node

/*
 * This file installs dependencies we require to generate the gutenboarding design thumbnails.
 * It is not used for any other purpose.
 * See: bin/generate-gutenboarding-design-thumbnails.js
 * @Automattic/create
 */
const spawnSync = require( 'child_process' ).spawnSync;
const fs = require( 'fs' );

// run a distclean to clean things up. just ci is not enough with the monorepo.
const cleanResult = spawnSync( 'yarn', [ 'run', 'distclean' ], {
	shell: true,
	stdio: 'inherit',
} );
if ( cleanResult.status ) {
	console.error( 'failed to clean: exited with code %d', cleanResult.status );
	process.exit( cleanResult.status );
}

const installResult = spawnSync( 'yarn', [ 'install', '--frozen-lockfile' ], {
	shell: true,
	stdio: 'inherit',
	env: { ...process.env },
} );
if ( installResult.status ) {
	console.error( 'failed to install: exited with code %d', installResult.status );
	process.exit( installResult.status );
}

/*
 * Add screenshot dependencies
 * I didn't want to add these to dependencies just for this script since these are kinda heavy ones)
 * https://www.npmjs.com/package/capture-website
 * https://www.npmjs.com/package/sharp
 */
const installDependencies = spawnSync( 'yarn', [ 'add', '-W', 'capture-website', 'sharp' ], {
	shell: true,
	stdio: 'inherit',
} );
if ( installDependencies.status ) {
	console.error( 'failed to clean: exited with code %d', installDependencies.status );
	process.exit( installDependencies.status );
}

const touchDate = new Date();
fs.utimesSync( 'node_modules', touchDate, touchDate );
