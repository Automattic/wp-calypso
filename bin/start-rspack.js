#!/usr/bin/env node

const { spawn, spawnSync } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );

const presets = {
	dashboard: {
		CALYPSO_ENV: 'dashboard-development',
		ENTRY_LIMIT: 'entry-main,entry-stepper,entry-dashboard-dotcom,entry-dashboard-ciab',
		SECTION_LIMIT: 'signup,checkout',
	},
};

const presetName = process.argv[ 2 ];

if ( presetName && ! presets[ presetName ] ) {
	console.error( `Unknown Rspack start preset: ${ presetName }` );
	process.exit( 1 );
}

for ( const [ name, value ] of Object.entries( presets[ presetName ] || {} ) ) {
	process.env[ name ] = process.env[ name ] || value;
}

process.env.CALYPSO_ENV = process.env.CALYPSO_ENV || 'development';

function run( command, args, env = {} ) {
	const result = spawnSync( command, args, {
		env: { ...process.env, ...env },
		stdio: 'inherit',
	} );

	if ( result.status !== 0 ) {
		process.exit( result.status || 1 );
	}
}

function readJson( file ) {
	try {
		return JSON.parse( fs.readFileSync( file, 'utf8' ) );
	} catch {
		return null;
	}
}

const serverBundle = 'build/server.js';
const serverBundleMeta = 'build/server.rspack-meta.json';
const serverBundleInputs = {
	CALYPSO_ENV: process.env.CALYPSO_ENV,
	ENTRY_LIMIT: process.env.ENTRY_LIMIT || '',
	SECTION_LIMIT: process.env.SECTION_LIMIT || '',
};
const hasRspackBundler =
	fs.existsSync( serverBundle ) &&
	fs.readFileSync( serverBundle, 'utf8' ).includes( 'CALYPSO_BUNDLER' );
const serverBundleSources = [
	'bin/start-rspack.js',
	'client/server/bundler/index.js',
	'client/server/bundler/rspack.js',
	'client/server/bundler/webpack.js',
	'client/rspack.config.js',
	'client/rspack.config.node.js',
	'client/webpack.config.node.js',
];
const serverBundleMtime = hasRspackBundler ? fs.statSync( serverBundle ).mtimeMs : 0;
const hasStaleServerBundle = serverBundleSources.some(
	( source ) => fs.existsSync( source ) && fs.statSync( source ).mtimeMs > serverBundleMtime
);
const hasSameServerBundleInputs =
	fs.existsSync( serverBundleMeta ) &&
	JSON.stringify( readJson( serverBundleMeta ) ) === JSON.stringify( serverBundleInputs );
const shouldBuildServer =
	process.env.RSPACK_REBUILD_SERVER === 'true' ||
	! hasRspackBundler ||
	hasStaleServerBundle ||
	! hasSameServerBundleInputs;

fs.mkdirSync( 'build', { recursive: true } );

if ( shouldBuildServer ) {
	run(
		path.join( 'node_modules', '.bin', 'rspack' ),
		[ '--config', 'client/rspack.config.node.js' ],
		{
			BROWSERSLIST_ENV: 'server',
		}
	);

	if ( process.env.CALYPSO_ENV === 'production' ) {
		run( process.execPath, [ 'bin/copy-production-modules.js' ] );
	}

	fs.writeFileSync( serverBundleMeta, JSON.stringify( serverBundleInputs ) );
}

const server = spawn( process.execPath, [ serverBundle ], {
	env: {
		...process.env,
		BROWSERSLIST_ENV: 'evergreen',
		CALYPSO_BUNDLER: 'rspack',
		PERSISTENT_CACHE: 'true',
		RSPACK_WATCH_POLL_INTERVAL: '1000',
	},
	stdio: 'inherit',
} );

function stop( signal ) {
	server.kill( signal );
}

process.on( 'SIGINT', () => stop( 'SIGINT' ) );
process.on( 'SIGTERM', () => stop( 'SIGTERM' ) );

server.on( 'exit', ( code, signal ) => {
	if ( signal ) {
		process.kill( process.pid, signal );
		return;
	}
	process.exit( code || 0 );
} );
