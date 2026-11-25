#!/usr/bin/env node
// Type-checks the apps that CI type-checks: every `apps/*/tsconfig.json`, except the apps
// in APPS_EXCLUDED_FROM_TYPE_CHECK.
import { spawn } from 'node:child_process';
import { basename, dirname } from 'node:path';
import util from 'node:util';
import glob from 'glob';
import { APPS_EXCLUDED_FROM_TYPE_CHECK } from './apps-excluded-from-type-check.mjs';

const tsconfigs = await util.promisify( glob )( 'apps/*/tsconfig.json' );
const appName = ( path ) => basename( dirname( path ) );

const skipped = tsconfigs.filter( ( path ) =>
	APPS_EXCLUDED_FROM_TYPE_CHECK.includes( appName( path ) )
);
const checked = tsconfigs.filter( ( path ) => ! skipped.includes( path ) );

if ( skipped.length ) {
	console.log(
		`Skipping ${ skipped.map( appName ).join( ', ' ) }: CI doesn't type-check them yet ` +
			'(see bin/apps-excluded-from-type-check.mjs).'
	);
}
if ( ! checked.length ) {
	console.log( 'No other app has a tsconfig.json, so there is nothing to type-check.' );
	process.exit( 0 );
}

const typeCheck = ( path ) =>
	new Promise( ( resolve ) => {
		console.log( `Type-checking ${ path }` );
		spawn( 'yarn', [ 'tsc', '--noEmit', '--project', path ], { stdio: 'inherit' } ).on(
			'close',
			( code ) => resolve( code === 0 )
		);
	} );

const results = await Promise.all( checked.map( typeCheck ) );
process.exit( results.every( Boolean ) ? 0 : 1 );
