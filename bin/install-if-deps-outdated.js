#!/usr/bin/env node

/**
 * Performs an `npm install`. Since that's a costly operation,
 * it will only perform it if needed, that is, if the packages
 * installed at `node_modules` aren't in sync over what
 * `npm-shrinkwrap.json` has. For that, modification times of both
 * files will be compared. If the shrinkwrap is newer, it means that
 * the packages at node_modules may be outdated. That will happen,
 * for example, when switching branches.
 *
 * @format
 */

const fs = require( 'fs' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;

const needsInstall = pack => {
	try {
		let lockfileTime = 0;
		const packageDir = path.dirname( pack );
		if ( fs.existsSync( path.resolve( packageDir, 'npm-shrinkwrap.json' ) ) ) {
			lockfileTime = fs.statSync( path.join( packageDir, 'npm-shrinkwrap.json' ) ).mtime;
		} else if ( fs.existsSync( path.join( packageDir, 'package-lock.json' ) ) ) {
			lockfileTime = fs.statSync( path.join( packageDir, 'package-lock.json' ) ).mtime;
		}

		if ( ! lockfileTime ) {
			//debug( '%s: true (no lockfile!)', packageDir );
			return true;
		}

		const nodeModulesTime = fs.statSync( path.join( packageDir, 'node_modules' ) ).mtime;
		const shouldInstall = lockfileTime - nodeModulesTime > 1000; // In Windows, directory mtime has less precision than file mtime
		//debug( 'checking %s => %s', packageDir, shouldInstall );
		return shouldInstall;
	} catch ( e ) {
		//debug( e );
		return true;
	}
};

if ( needsInstall( '.' ) ) {
	//debug( 'installing because of node_modules' );
	install();
} else {
	require( 'glob' )( 'packages/*/package.json', ( err, matches ) => {
		if ( err ) {
			console.error( err );
			process.exit( 2 );
		}
		if ( matches.some( match => needsInstall( match ) ) ) {
			install();
		}
	} );
}

function install() {
	const installResult = spawnSync( 'npx', [ 'lerna', 'bootstrap', '--ci' ], {
		shell: true,
		stdio: 'inherit',
	} ).status;
	if ( installResult ) {
		process.exit( installResult );
	}
	const touchDate = new Date();

	fs.utimesSync( 'node_modules', touchDate, touchDate );
	require( 'glob' )( 'packages/*/node_modules', ( err, matches ) => {
		matches.forEach( m => fs.utimesSync( m, touchDate, touchDate ) );
	} );
}
