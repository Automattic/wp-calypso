#!/usr/bin/env node
// @ts-check

/**
 * Links or unlinks `.vscode/settings-sample.jsonc` to `.vscode/settings.json`.
 *
 * Usage:
 * To link, run `node bin/set-up-vs-code.js`
 * To unlink, run `node bin/set-up-vs-code.js --unlink`
 */

const fs = require( 'fs' );
const path = require( 'path' );
const chalk = require( 'chalk' );
const yargs = require( 'yargs' );

const settingsPath = path.resolve( __dirname, '../.vscode/settings.json' );
const settingsSamplePath = path.resolve( __dirname, '../.vscode/settings-sample.jsonc' );

const stat = fs.lstatSync( settingsPath, { throwIfNoEntry: false } );

function symlinkExists() {
	return stat && stat.isSymbolicLink();
}

function fileExists() {
	return stat && stat.isFile();
}

function link() {
	if ( symlinkExists() ) {
		console.log( `Symlink for .vscode/settings.json already exists. ✅\n` );
		return;
	}
	if ( fileExists() ) {
		console.log(
			chalk.yellow(
				`Warning: Cannot create a symlink for .vscode/settings.json as the file already exists.\n`
			)
		);
		console.log(
			`You may delete .vscode/settings.json or if you wish to maintain it yourself, please copy the contents of .vscode/settings-sample.jsonc to .vscode/settings.json and make your changes.\n`
		);
		return;
	}
	try {
		fs.symlinkSync( settingsSamplePath, settingsPath, 'junction' );
		console.log( chalk.green( `Successfully created a symlink for .vscode/settings.json ✅\n` ) );
	} catch ( error ) {
		console.log( chalk.red( 'Error creating a symlink for .vscode/settings.json' ), error, `\n` );
	}
}

function unlink() {
	if ( fileExists() ) {
		console.log(
			chalk.yellow(
				`Warning: Cannot remove symlink for .vscode/settings.json as it is a file and not a symlink.\n`
			)
		);
		console.log(
			`If you do NOT want to manage .vscode/settings.json yourself, you can delete it and run\n\nyarn vscode:link\n`
		);
		return;
	}

	if ( symlinkExists() ) {
		try {
			fs.unlinkSync( settingsPath );
			console.log( chalk.green( `Removed symlink for .vscode/settings.json ✅\n` ) );
		} catch ( error ) {
			console.error(
				chalk.red( 'Failed to remove symlink for .vscode/settings.json' ),
				error,
				`\n`
			);
		}
	} else {
		console.log( `No symlink exists for .vscode/settings.json\n` );
	}
}

if ( yargs.argv.unlink ) {
	unlink();
} else {
	link();
}
