#!/usr/bin/env node

const execSync = require( 'child_process' ).execSync;
const spawnSync = require( 'child_process' ).spawnSync;
const chalk = require( 'chalk' );
const fs = require( 'fs' );
const prettier = require( 'prettier' );
const path = require( 'path' );
const _ = require( 'lodash' );

console.log( '\nBy contributing to this project, you license the materials you contribute ' +
	'under the GNU General Public License v2 (or later). All materials must have ' +
	'GPLv2 compatible licenses — see .github/CONTRIBUTING.md for details.\n\n' );

// Make quick pass over config files on every change
require( '../server/config/validate-config-keys' );

const files = execSync( 'git diff --cached --name-only' )
	.toString()
	.split( '\n' )
	.map( ( name ) => name.trim() )
	.filter( ( name ) => name.endsWith( '.js' ) || name.endsWith( '.jsx' ) );

const lintResult = spawnSync( 'eslint-eslines', [ ...files, '--', '--diff=index' ], {
	shell: true,
	stdio: 'inherit',
} );

if ( lintResult.status ) {
	console.log( chalk.red( 'COMMIT ABORTED:' ), 'The linter reported some problems. ' +
		'If you are aware of them and it is OK, ' +
		'repeat the commit command with --no-verify to avoid this check.' );
	process.exit( 1 );
}


// run prettier for any files in the commit that have @format within their first docblock
const formatRegex = /@format/;
const firstDocBlockStart = /\/\*\*/;
const firstDocBlockEnd = /\*\//;

files
	.map( file => path.join( __dirname, '../', file ) )
	.forEach( file => {
		fs.readFile( file, 'utf8', ( err, data ) => {
			const firstDocBlockStartIndex = _.get( firstDocBlockStart.exec( data ), 'index' );
			const firstDocBlockEndIndex = _.get( firstDocBlockEnd.exec( data ), 'index' );
			const firstDocBlockText =
				_.isInteger( firstDocBlockStartIndex ) &&
				_.isInteger( firstDocBlockEndIndex ) &&
				data.substring( firstDocBlockStartIndex, firstDocBlockEndIndex + 2 );

			if ( firstDocBlockText && formatRegex.test( firstDocBlockText ) ) {
				const formattedData = prettier.format( data, {} );
				fs.writeFileSync( file, formattedData );
				execSync( `git add ${ file }` );
			}
		} );
} );
