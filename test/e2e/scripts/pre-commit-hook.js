/**
 * External dependencies
 */
const execSync = require( 'child_process' ).execSync;
const spawnSync = require( 'child_process' ).spawnSync;
const fs = require( 'fs' );
const prettier = require( 'prettier' );

/**
 * Parses the output of a git diff command into javascript file paths.
 *
 * @param   {string} command Command to run. Expects output like `git diff --name-only […]`
 * @returns {Array}          Paths output from git command
 */
function parseGitDiffToPathArray( command ) {
	return execSync( command )
		.toString()
		.split( '\n' )
		.map( ( name ) => name.trim() )
		.filter(
			( name ) => name.endsWith( '.js' ) || name.endsWith( '.jsx' ) || name.endsWith( '.scss' )
		);
}

const dirtyFiles = new Set( parseGitDiffToPathArray( 'git diff --name-only --diff-filter=ACM' ) );

const files = parseGitDiffToPathArray( 'git diff --cached --name-only --diff-filter=ACM' );

// run prettier for any files in the commit
files.forEach( ( file ) => {
	const text = fs.readFileSync( file, 'utf8' );
	// File has unstaged changes. It's a bad idea to modify and add it before commit.
	if ( dirtyFiles.has( file ) ) {
		console.log( `${ file } will not be auto-formatted because it has unstaged changes.` );
		return;
	}

	const formattedText = prettier.format( text );

	// No change required.
	if ( text === formattedText ) {
		return;
	}

	fs.writeFileSync( file, formattedText );
	console.log( `Prettier formatting file: ${ file }` );
	execSync( `git add ${ file }` );
} );

// We may have no files to lint. Prevent eslint from printing help documentation.
if ( files.length ) {
	// linting should happen after formatting
	const lintResult = spawnSync( 'eslint', [ ...files, '--max-warnings=0' ], {
		shell: true,
		stdio: 'inherit',
	} );

	if ( lintResult.status ) {
		console.log(
			'COMMIT ABORTED:',
			'The linter reported some problems. ' +
				'If you are aware of them and it is OK, ' +
				'repeat the commit command with --no-verify to avoid this check.'
		);
		process.exit( 1 ); // eslint-disable-line no-process-exit
	}
}
