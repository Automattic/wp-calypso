#!/usr/bin/env node

const execSync = require( 'child_process' ).execSync;
const spawnSync = require( 'child_process' ).spawnSync;
const chalk = require( 'chalk' );

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

const lintResult = spawnSync( 'node', [ 'bin/run-lint', ...files, '--', '--diff=index' ], {
	shell: true,
	stdio: 'inherit',
} );

if ( lintResult.status ) {
	console.log( chalk.red( 'COMMIT ABORTED:' ), 'The linter reported some problems. ' +
		'If you are aware of them and it is OK, ' +
		'repeat the commit command with --no-verify to avoid this check.' );
	process.exit( 1 );
}
