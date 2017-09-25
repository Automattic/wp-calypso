/**
 * External dependencies
 */
const path = require( 'path' );
const child_process = require( 'child_process' );

/**
 * Internal dependencies
 */
const config = require( './config' );

function bindEvents( jscodeshiftProcess ) {
	jscodeshiftProcess.stdout.on( 'data', ( data ) => {
		process.stdout.write( data );
	} );

	jscodeshiftProcess.stderr.on( 'data', ( data ) => {
		process.stderr.write( data );
	} );
}

function runCodemod( generateBinArgs ) {
	const args = process.argv.slice( 2 );
	if ( args.length === 0 ) {
		process.stdout.write( 'No files to transform\n' );
		process.exit( 0 );
	}

	const binArgs = generateBinArgs( config, args );
	const binPath = path.join( '.', 'node_modules', '.bin', 'jscodeshift' );
	const jscodeshift = child_process.spawn( binPath, binArgs );
	bindEvents( jscodeshift );
}

module.exports = {
	runCodemod,
};
