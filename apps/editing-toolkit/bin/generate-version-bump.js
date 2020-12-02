/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */
/* eslint-disable no-process-exit */

/**
 * Generate a version bump for the Editing Toolkit plugin.
 *
 * This script will update the following:
 *
 * 1. `editing-toolkit-plugin/readme.txt` - Update `stable` tag in the plugin's header comment.
 * 2. `editing-toolkit-plugin/readme.txt` - Update the changelog.
 * 3. `editing-toolkit-plugin/full-site-editing-plugin.php` - Update the plugin version in the top comment.
 * 4. `editing-toolkit-plugin/full-site-editing-plugin.php` - Update the plugin version constant.
 * 5. `package.json` - Update to the new version.
 */

const fs = require( 'fs' );
const path = require( 'path' );

function updatePackageJson( newVersion ) {}

function updateFullSiteEditingPluginPhp( newVersion ) {}

function updateReadmeTxt( newVersion, readme ) {
	// Update stable tag;
	let updatedReadme = readme.replace( /Stable tag: \d+.\d+.\d+/, 'Stable tag: ' + newVersion ); // TODO: fix this regex

	const lastVersionRegex = new RegExp(
		'== Changelog ==[\\s\\S]*?(?:= (?!' + newVersion + ')(\\d+.\\d+.\\d+) =)',
		'g'
	);

	const matchLastVersion = lastVersionRegex.exec( updatedReadme );
	const lastVersion =
		matchLastVersion && matchLastVersion.length > 1 ? matchLastVersion[ 1 ] : null;

	if ( lastVersion ) {
		// Update changelog

		// Clear any updates for the current version so that the script can safely be run multiple times.
		updatedReadme = updatedReadme.replace(
			lastVersionRegex,
			'== Changelog ==\n\n= ' + lastVersion + ' ='
		);

		// Create the changelog.
		const changeLog =
			'== Changelog ==\n\n' +
			'= ' +
			newVersion +
			' =\n' +
			'* This is a single item\n' +
			'* This is another one';

		// Update the readme with the new change log.
		updatedReadme = updatedReadme.replace( /== Changelog ==/, changeLog );
	}

	return updatedReadme;
}

/**
 * Handles reading and writing files, and defers mutating strings
 * (updating the contents of the files) to other functions.
 *
 * @param {string} newVersion The new plugin version in SemVer format.
 */
function generateVersionBump( newVersion ) {
	const readmeFile = path.resolve( 'editing-toolkit-plugin/readme.txt' );
	const fsePhpFile = path.resolve( 'editing-toolkit-plugin/full-site-editing-plugin.php' );
	const packageJson = path.resolve( 'package.json' );

	fs.readFile( readmeFile, 'utf-8', ( readErr, data ) => {
		if ( readErr ) {
			console.log( '❌ Failed to open file: ' + readmeFile );
			process.exitCode = 1;
			throw readErr;
		}

		const updatedReadme = updateReadmeTxt( newVersion, data );

		fs.writeFile( readmeFile, updatedReadme, 'utf8', ( writeErr ) => {
			if ( writeErr ) {
				console.log( '❌ Failed to write to file: ' + readmeFile );
				process.exitCode = 1;
				throw writeErr;
			}
		} );
	} );
}

/**
 * Check that a valid version number has been passed in to this script.
 *
 * The version number should be SemVer style, e.g. in MAJOR.MINOR.PATCH format.
 */
function init() {
	const providedArgs = process.argv.slice( 2 );

	if ( providedArgs[ 0 ] && providedArgs[ 0 ].match( /^\d+.\d+.\d+$/ ) ) {
		generateVersionBump( providedArgs[ 0 ] );
	} else {
		console.log( '❌ Please provide a valid SemVer style version number, e.g. 1.0.0' );
		process.exitCode = 1;
	}
}

init();
