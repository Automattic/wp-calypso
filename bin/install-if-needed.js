#!/usr/bin/env node

/**
 * Performs an `npm install`. Since that's a costly operation,
 * it will only perform it if needed, that is, if the packages
 * installed at `node_modules` aren't in sync over what
 * `npm-shrinkwrap.json` has. For that, modification times of both
 * files will be compared. If the shrinkwrap is newer, it means that
 * the packages at node_modules may be outdated. That will happen,
 * for example, when switching branches.
 */

const fs = require( 'fs' );
const spawnSync = require( 'child_process' ).spawnSync;

const needsInstall = () => {
	try {
		const shrinkwrapTime = fs.statSync( 'npm-shrinkwrap.json' ).mtime;
		const nodeModulesTime = fs.statSync( 'node_modules' ).mtime;
		return shrinkwrapTime - nodeModulesTime > 1000; // In Windows, directory mtime has less precision than file mtime
	} catch ( e ) {
		return true;
	}
};

if ( needsInstall() ) {
	const installResult = spawnSync( 'npm', [ 'install' ], {
		shell: true,
		stdio: 'inherit',
	});
	process.exit( installResult.status );
}
