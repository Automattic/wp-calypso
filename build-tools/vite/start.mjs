/**
 * Starts the Calypso server with the client served by Vite, in one process: `yarn start-dashboard:vite`.
 * It serves what `yarn start-dashboard` does, and builds the server with Vite, not webpack.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { root } from './base.mjs';

process.env.CALYPSO_ENV ??= 'dashboard-development';
process.env.NODE_ENV ??= 'development';
process.env.BROWSERSLIST_ENV ??= 'evergreen';
process.env.CALYPSO_BUNDLER = 'vite';

// Checks the `engines.node` range: the major version in `.nvmrc`, at or above its minor and patch.
function checkNodeVersion() {
	const wanted = fs.readFileSync( path.join( root, '.nvmrc' ), 'utf8' ).trim().replace( /^v/, '' );
	const [ major, minor, patch ] = wanted.split( '.' ).map( Number );
	const [ actualMajor, actualMinor, actualPatch ] = process.versions.node
		.split( '.' )
		.map( Number );
	const satisfied =
		actualMajor === major &&
		( actualMinor > minor || ( actualMinor === minor && actualPatch >= patch ) );
	if ( ! satisfied ) {
		console.error(
			`Calypso needs Node ^${ wanted } (see .nvmrc), but this is ${ process.version }.`
		);
		process.exit( 1 );
	}
}

function run( command, args ) {
	const { status } = spawnSync( command, args, { cwd: root, stdio: 'inherit' } );
	if ( status !== 0 ) {
		process.exit( status ?? 1 );
	}
}

checkNodeVersion();

// Builds the workspace packages unless they're built already.
if (
	process.env.SKIP_CALYPSO_PACKAGE_BUILDS !== 'true' &&
	! fs.existsSync( path.join( root, 'packages/create-calypso-config/dist' ) )
) {
	console.log( 'Building packages...' );
	run( 'yarn', [
		'workspaces',
		'foreach',
		'--all',
		'--parallel',
		'--topological',
		'run',
		'prepare',
	] );
}

if ( ! fs.existsSync( path.join( root, 'public' ) ) ) {
	run( 'yarn', [ 'run', 'build-static' ] );
}

const started = performance.now();
const { build } = await import( 'vite' );
const { devServerBuildConfig } = await import( './server.mjs' );
await build( devServerBuildConfig() );
console.log( `Built the server with Vite in ${ Math.round( performance.now() - started ) }ms.` );

createRequire( import.meta.url )( path.join( root, 'build/server-vite.cjs' ) );
