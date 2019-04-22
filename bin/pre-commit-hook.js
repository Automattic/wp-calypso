/** @format */

/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const spawnSync = require( 'child_process' ).spawnSync;
const chalk = require( 'chalk' );
const _ = require( 'lodash' );

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
		.filter( name => /(?:\.json|\.[jt]sx?|\.scss)$/.test( name ) );
}

// grab a list of all the files staged to commit
const files = parseGitDiffToPathArray( 'git diff --cached --name-only --diff-filter=ACM' );

// grab a list of all the files with changes in the working copy.
// This list may have overlaps with the staged list if files are
// partially staged...
const dirtyFiles = new Set( parseGitDiffToPathArray( 'git diff --name-only --diff-filter=ACM' ) );

// we don't want to format any files that are partially staged or unstaged
dirtyFiles.forEach( file =>
	console.log(
		chalk.red( `${ file } will not be auto-formatted because it has unstaged changes.` )
	)
);

// Remove all the dirty files from the set to format
const toFormat = files.filter( file => ! dirtyFiles.has( file ) );

// Split the set to format into things to format with stylelint and things to format with prettier.
// We avoid prettier on sass files because of outstanding bugs in how prettier handles
// single line comments.
const [ toStylelintfix, toPrettify ] = _.partition( toFormat, file => file.endsWith( '.scss' ) );

// Format JavaScript and TypeScript files with prettier, then re-stage them. Swallow the output.
toPrettify.forEach( file => console.log( `Prettier formatting staged file: ${ file }` ) );
if ( toPrettify.length ) {
	execSync(
		`./node_modules/.bin/prettier --ignore-path .eslintignore --write ${ toPrettify.join( ' ' ) }`
	);
	execSync( `git add ${ toPrettify.join( ' ' ) }` );
}

// Format the sass files with stylelint and then re-stage them. Swallow the output.
toStylelintfix.forEach( file => console.log( `stylelint formatting staged file: ${ file }` ) );
if ( toStylelintfix.length ) {
	spawnSync( `./node_modules/.bin/stylelint --fix ${ toStylelintfix.join( ' ' ) }` );
	execSync( `git add ${ toStylelintfix.join( ' ' ) }` );
}

// Now run the linters over everything staged to commit, even if they are partially staged
const [ toStylelint, toEslint ] = _.partition(
	files.filter( file => ! file.endsWith( '.json' ) ),
	file => file.endsWith( '.scss' )
);

// first stylelint
if ( toStylelint.length ) {
	const lintResult = spawnSync( './node_modules/.bin/stylelint', [ ...toStylelint ], {
		shell: true,
		stdio: 'inherit',
	} );

	if ( lintResult.status ) {
		console.log(
			chalk.yellow( 'STYLELINT:' ),
			'The linter reported some problems. Please consider fixing them.'
		);
		//process.exit( 1 );
		// do not abort the commit for now. Maybe in the future...
	}
}

// then eslint
if ( toEslint.length ) {
	const lintResult = spawnSync( './node_modules/.bin/eslint', [ '--quiet', ...toEslint ], {
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
