#!/usr/bin/env node

/**
 * Runs `eslint` only on the files the current branch modified.
 * Note that this has file-level granularity, so if you modified a
 * small bit of a big fail, you may get errors that weren't caused by you.
 */

const child_process = require( 'child_process' );
const path = require( 'path' );
const yargs = require( 'yargs' );

const branchName = child_process.execSync( 'git rev-parse --abbrev-ref HEAD' ).toString().trim();

const revision = child_process
	.execSync( 'git merge-base ' + branchName + ' trunk' )
	.toString()
	.trim();

const files = child_process
	.execSync( 'git diff --name-only --diff-filter=d ' + revision + ' HEAD' )
	.toString()
	.split( '\n' )
	.map( ( name ) => name.trim() )
	.filter( ( name ) => /\.[jt]sx?$/.test( name ) );

const flags = [ '--cache' ];

if ( yargs.argv.fix ) {
	flags.push( '--fix' );
}

const eslintBin = path.join( '.', 'node_modules', '.bin', 'eslint' );

const lintResult = child_process.spawnSync( eslintBin, [ ...flags, ...files ], {
	shell: true,
	stdio: 'inherit',
} );

process.exit( lintResult.status );
