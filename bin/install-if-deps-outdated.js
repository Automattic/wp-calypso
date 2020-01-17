#!/usr/bin/env node

/**
 * Installs `node_modules` with `npm ci`. Since that's a costly operation,
 * it will only perform it if needed, that is, if the packages
 * installed at `node_modules` aren't in sync over what
 * `package-lock.json` has. For that, modification times of both
 * files will be compared. If the lockfile is newer, it means that
 * the packages at node_modules may be outdated. That will happen,
 * for example, when switching branches.
 *
 */

const fs = require( 'fs' );
const path = require( 'path' );
const { spawnSync } = require( 'child_process' );
//const debug = require( 'debug' )( 'calypso:install' );

const needsInstall = () => {
	try {
		let lockfileTime = 0;
		const packageDir = path.dirname( '.' );
		if ( fs.existsSync( path.join( packageDir, 'package-lock.json' ) ) ) {
			lockfileTime = fs.statSync( path.join( packageDir, 'package-lock.json' ) ).mtime;
		}

		if ( ! lockfileTime ) {
			//debug( '%s: true (no lockfile!)', packageDir );
			return true;
		}

		const nodeModulesTime = fs.statSync( path.join( packageDir, 'node_modules' ) ).mtime;
		return lockfileTime - nodeModulesTime > 1000; // In Windows, directory mtime has less precision than file mtime
	} catch ( e ) {
		//debug( e );
		return true;
	}
};

if ( needsInstall() ) {
	install();
}

function install() {
	// run a distclean to clean things up. just ci is not enough with the monorepo.
	const cleanResult = spawnSync( 'npm', [ 'run', 'distclean' ], {
		shell: true,
		stdio: 'inherit',
	} );
	if ( cleanResult.status ) {
		console.error( 'failed to clean: exited with code %d', cleanResult.status );
		process.exit( cleanResult.status );
	}

	const installResult = spawnSync( 'npm', [ 'ci' ], {
		shell: true,
		stdio: 'inherit',
		env: Object.assign( { PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true' }, process.env ),
	} );
	if ( installResult.status ) {
		console.error( 'failed to install: exited with code %d', installResult.status );
		process.exit( installResult.status );
	}

	const touchDate = new Date();
	fs.utimesSync( 'node_modules', touchDate, touchDate );
}
