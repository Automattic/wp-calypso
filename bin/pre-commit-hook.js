#!/usr/bin/env node

/**
 * A blank docblock to prevent prettier from formatting this file
 */

/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const spawnSync = require( 'child_process' ).spawnSync;
const chalk = require( 'chalk' );
const fs = require( 'fs' );
const prettier = require( 'prettier' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const shouldFormat = require( './utils/should-format' );

console.log(
	'\nBy contributing to this project, you license the materials you contribute ' +
		'under the GNU General Public License v2 (or later). All materials must have ' +
		'GPLv2 compatible licenses — see .github/CONTRIBUTING.md for details.\n\n'
);

// Make quick pass over config files on every change
require( '../server/config/validate-config-keys' );

const files = execSync( 'git diff --cached --name-only --diff-filter=ACM' )
	.toString()
	.split( '\n' )
	.map( name => name.trim() )
	.filter( name => name.endsWith( '.js' ) || name.endsWith( '.jsx' ) );

// run prettier for any files in the commit that have @format within their first docblock
files
	.map( file => path.join( __dirname, '../', file ) )
	.forEach( file => {
		const text = fs.readFileSync( file, 'utf8' );
		if ( shouldFormat( text ) ) {
			console.log( `Prettier formatting file: ${ file } because it contains the @format flag` );
			const formattedText = prettier.format( text, {} );
			fs.writeFileSync( file, formattedText );
			execSync( `git add ${ file }` );
		}
	} );

// linting should happen after formatting
const lintResult = spawnSync( 'eslint-eslines', [ ...files, '--', '--diff=index' ], {
	shell: true,
	stdio: 'inherit',
} );

if ( lintResult.status ) {
	console.log(
		chalk.red( 'COMMIT ABORTED:' ),
		'The linter reported some problems. ' +
			'If you are aware of them and it is OK, ' +
			'repeat the commit command with --no-verify to avoid this check.'
	);
	process.exit( 1 );
}
