/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const spawnSync = require( 'child_process' ).spawnSync;
const existsSync = require( 'fs' ).existsSync;
const chalk = require( 'chalk' );
const _ = require( 'lodash' );
const path = require( 'path' );

const composerBinDir = path.join( __dirname, '..', 'vendor', 'bin' );
const phpcsPath = path.join( composerBinDir, 'phpcs' );
const phpcbfPath = path.join( composerBinDir, 'phpcbf' );

console.log(
	'\nBy contributing to this project, you license the materials you contribute ' +
		'under the GNU General Public License v2 (or later). All materials must have ' +
		'GPLv2 compatible licenses — see docs/CONTRIBUTING.md for details.\n\n'
);

// Make quick pass over config files on every change
require( './validate-config-keys' );

/**
 * Parses the output of a git diff command into file paths.
 *
 * @param   {string} command Command to run. Expects output like `git diff --name-only […]`
 * @returns {Array}          Paths output from git command
 */
function parseGitDiffToPathArray( command ) {
	return execSync( command, { encoding: 'utf8' } )
		.split( '\n' )
		.map( ( name ) => name.trim() )
		.filter( ( name ) => /(?:\.json|\.[jt]sx?|\.scss|\.php)$/.test( name ) );
}

function linterFailure() {
	console.log(
		chalk.red( 'COMMIT ABORTED:' ),
		'The linter reported some problems. ' +
			'If you are aware of them and it is OK, ' +
			'repeat the commit command with --no-verify to avoid this check.'
	);
	process.exit( 1 );
}

function printPhpcsDocs() {
	console.log(
		chalk.red( 'COMMIT ABORTED:' ),
		'Working with PHP files in this repository requires the PHP Code Sniffer and its dependencies to be installed. Make sure you have composer installed on your machine and from the root of this repository, run `composer install`.'
	);
	process.exit( 1 );
}

function phpcsInstalled() {
	if ( existsSync( phpcsPath ) && existsSync( phpcbfPath ) ) {
		return true;
	}
	return false;
}

// determine if PHPCS is available
const phpcs = phpcsInstalled();

// grab a list of all the files staged to commit
const files = parseGitDiffToPathArray( 'git diff --cached --name-only --diff-filter=ACM' );

// grab a list of all the files with changes in the working copy.
// This list may have overlaps with the staged list if files are
// partially staged...
const dirtyFiles = new Set( parseGitDiffToPathArray( 'git diff --name-only --diff-filter=ACM' ) );

// we don't want to format any files that are partially staged or unstaged
dirtyFiles.forEach( ( file ) =>
	console.log(
		chalk.red( `${ file } will not be auto-formatted because it has unstaged changes.` )
	)
);

// Remove all the dirty files from the set to format
const toFormat = files.filter( ( file ) => ! dirtyFiles.has( file ) );

// Split the set to format into things to format with stylelint and things to format with prettier.
// We avoid prettier on sass files because of outstanding bugs in how prettier handles
// single line comments. We also split on PHP files for PHPCS handling.
const { toPrettify = [], toStylelintfix = [], toPHPCBF = [] } = _.groupBy( toFormat, ( file ) => {
	switch ( true ) {
		case file.endsWith( '.scss' ):
			return 'toStylelintfix';
		case file.endsWith( '.php' ):
			return 'toPHPCBF';
		default:
			return 'toPrettify';
	}
} );

// Format JavaScript and TypeScript files with prettier, then re-stage them. Swallow the output.
toPrettify.forEach( ( file ) => console.log( `Prettier formatting staged file: ${ file }` ) );
if ( toPrettify.length ) {
	// chunk this up into multiple runs if we have a lot of files to avoid E2BIG
	_.forEach( _.chunk( toPrettify, 500 ), ( chunk ) => {
		execSync(
			`./node_modules/.bin/prettier --ignore-path .eslintignore --write ${ chunk.join( ' ' ) }`
		);
		execSync( `git add ${ chunk.join( ' ' ) }` );
	} );
}

// Format the sass files with stylelint and then re-stage them. Swallow the output.
toStylelintfix.forEach( ( file ) => console.log( `stylelint formatting staged file: ${ file }` ) );
if ( toStylelintfix.length ) {
	spawnSync( `./node_modules/.bin/stylelint --fix ${ toStylelintfix.join( ' ' ) }` );
	execSync( `git add ${ toStylelintfix.join( ' ' ) }` );
}

// Format the PHP files with PHPCBF and then re-stage them. Swallow the output.
toPHPCBF.forEach( ( file ) => console.log( `PHPCBF formatting staged file: ${ file }` ) );
if ( toPHPCBF.length ) {
	if ( phpcs ) {
		try {
			execSync( `${ phpcbfPath } --standard=apps/phpcs.xml ${ toPHPCBF.join( ' ' ) }` );
		} catch ( error ) {
			// PHPCBF returns a `0` or `1` exit code on success, and `2` on failures. ¯\_(ツ)_/¯
			// https://github.com/squizlabs/PHP_CodeSniffer/blob/master/src/Runner.php#L210
			if ( 2 === error.status ) {
				linterFailure();
			}
		}
		execSync( `git add ${ toPHPCBF.join( ' ' ) }` );
	} else {
		printPhpcsDocs();
	}
}

// Now run the linters over everything staged to commit (excepting JSON), even if they are partially staged
const { toEslint = [], toStylelint = [], toPHPCS = [] } = _.groupBy(
	files.filter( ( file ) => ! file.endsWith( '.json' ) ),
	( file ) => {
		switch ( true ) {
			case file.endsWith( '.scss' ):
				return 'toStylelint';
			case file.endsWith( '.php' ):
				return 'toPHPCS';
			default:
				return 'toEslint';
		}
	}
);

// first stylelint
if ( toStylelint.length ) {
	const lintResult = spawnSync( './node_modules/.bin/stylelint', [ ...toStylelint ], {
		shell: true,
		stdio: 'inherit',
	} );

	if ( lintResult.status ) {
		linterFailure();
	}
}

// then eslint
if ( toEslint.length ) {
	const lintResult = spawnSync( './node_modules/.bin/eslint', [ '--quiet', ...toEslint ], {
		shell: true,
		stdio: 'inherit',
	} );

	if ( lintResult.status ) {
		linterFailure();
	}
}

// and finally PHPCS
if ( toPHPCS.length ) {
	if ( phpcs ) {
		const lintResult = spawnSync( phpcsPath, [ '--standard=apps/phpcs.xml', ...toPHPCS ], {
			shell: true,
			stdio: 'inherit',
		} );

		if ( lintResult.status ) {
			linterFailure();
		}
	} else {
		printPhpcsDocs();
	}
}
