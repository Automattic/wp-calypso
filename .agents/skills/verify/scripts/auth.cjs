#!/usr/bin/env node
/**
 * Saves your own WordPress.com session for `browse.cjs --as me`. E2E test accounts don't
 * need this: browse.cjs logs them in by itself.
 *
 *   node auth.cjs me
 */
const { OWN_ACCOUNT, UserActionRequired, logInOwnAccount, statePath } = require( './lib.cjs' );

if ( process.argv[ 2 ] !== OWN_ACCOUNT ) {
	console.error( 'Usage: node auth.cjs me' );
	process.exit( 1 );
}

logInOwnAccount()
	.then( () => console.log( `Saved your session to ${ statePath( OWN_ACCOUNT ) }` ) )
	.catch( ( error ) => {
		console.error( error instanceof UserActionRequired ? error.message : error );
		process.exit( error instanceof UserActionRequired ? 2 : 1 );
	} );
