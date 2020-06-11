/**
 * @file Creates a checksum the represents all files in packages dir except "dist" and "node_modules"
 * This checksum can be used as a way to tell if packages folder was modified and needs a rebuild
 */

const checksumFileExplanation = `This is a checksum file representing packages folder.
It's generated after every build of the packages folder.
When packages folder has the same checksum as the one in this file, it means no rebuild is needed.
This file helps cutting down the number on unnecessary builds.
Deleting or editing this file will force a rebuild, checksum is:\n\n`;

const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );

const PACKAGES_DIR = './packages';
const APPS_DIR = './apps';
const IGNORED_DIRS = [ 'dist' ];
const IGNORED_FILES = [ 'packages-checksum.txt' ];
const isCalledFromCLI = ! module.parent;
const nvmrcFile = path.resolve( __dirname, '..', '.nvmrc' );
const babelConfigFile = path.resolve( __dirname, '..', 'babel.config.js' );
const packageJSON = path.resolve( __dirname, '..', 'package.json' );
const yarnLock = path.resolve( __dirname, '..', 'yarn.lock' );

/**
 * Asynchronously yet recursively traverses a given dir
 *
 * @param {string} dir the starting directory
 */
async function* traverse( dir ) {
	for await ( const fileOrDir of await fs.promises.opendir( dir ) ) {
		const entry = path.join( dir, fileOrDir.name );
		if ( fileOrDir.isDirectory() && ! IGNORED_DIRS.includes( fileOrDir.name ) ) {
			yield* traverse( entry );
		} else if ( fileOrDir.isFile() && ! IGNORED_FILES.includes( fileOrDir.name ) ) {
			yield entry;
		}
	}
}

async function digestPackagesDir() {
	const hash = crypto.createHash( 'sha256' );
	const files = [];
	for await ( const file of traverse( PACKAGES_DIR ) ) {
		files.push( file );
	}

	for await ( const file of traverse( APPS_DIR ) ) {
		files.push( file );
	}

	// sort files, opendir doesn't guarantee order
	files.sort( ( a, b ) => a.localeCompare( b ) );

	for await ( const file of files ) {
		hash.update( await fs.promises.readFile( file ) );
	}

	// include nvmrc to the hash to make sure to rebuild when node version changes
	hash.update( await fs.promises.readFile( nvmrcFile ) );

	// include babelConfigFile to the hash to make sure to rebuild when it version changes
	hash.update( await fs.promises.readFile( babelConfigFile ) );

	// include packageJSON JSON file to rebuild if something is installed/updated/deleted
	hash.update( await fs.promises.readFile( packageJSON ) );

	// include yarnLock JSON file to rebuild if something is installed/updated/deleted
	hash.update( await fs.promises.readFile( yarnLock ) );

	return checksumFileExplanation + hash.digest( 'base64' );
}

if ( isCalledFromCLI ) {
	digestPackagesDir().then( ( checksum ) => process.stdout.write( checksum ) );
}

module.exports = digestPackagesDir;
