/** @format */

/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const spawnSync = require( 'child_process' ).spawnSync;
const chalk = require( 'chalk' );

console.log(
	'\nBy contributing to this project, you license the materials you contribute ' +
		'under the GNU General Public License v2 (or later). All materials must have ' +
		'GPLv2 compatible licenses — see .github/CONTRIBUTING.md for details.\n\n'
);

// Make quick pass over config files on every change
require( '../server/config/validate-config-keys' );

/**
 * Parses the output of a git diff command into javascript file paths.
 *
 * @param   {String} command Command to run. Expects output like `git diff --name-only […]`
 * @returns {Array}          Paths output from git command
 */
function parseGitDiffToPathArray( command ) {
	return execSync( command, { encoding: 'utf8' } )
		.split( '\n' )
		.map( name => name.trim() )
		.filter( name => /\.(jsx?|scss)$/.test( name ) );
}

const dirtyFiles = new Set( parseGitDiffToPathArray( 'git diff --name-only --diff-filter=ACM' ) );
const files = parseGitDiffToPathArray( 'git diff --cached --name-only --diff-filter=ACM' );

dirtyFiles.forEach( file =>
	console.log(
		chalk.red( `${ file } will not be auto-formatted because it has unstaged changes.` )
	)
);

const toPrettify = files.filter( file => ! dirtyFiles.has( file ) );
toPrettify.forEach( file => console.log( `Prettier formatting staged file: ${ file }` ) );

if ( toPrettify.length ) {
	execSync(
		`./node_modules/.bin/prettier --ignore-path .eslintignore --write ${ toPrettify.join( ' ' ) }`
	);
	execSync( `git add ${ toPrettify.join( ' ' ) }` );
}

// linting should happen after formatting
const toLint = files.filter( file => ! file.endsWith( '.scss' ) );

if ( toLint.length ) {
	const lintResult = spawnSync( './node_modules/.bin/eslint', [ '--quiet', ...toLint ], {
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
}
