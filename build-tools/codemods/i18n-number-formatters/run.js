#!/usr/bin/env node

const path = require( 'path' );
const { run: jscodeshift } = require( 'jscodeshift/src/Runner' );

const transformPath = path.join( __dirname, 'transform.js' );

const paths = process.argv.slice( 2 );

if ( paths.length === 0 ) {
	console.error( 'Please provide at least one path to transform' );
	process.exit( 1 );
}

const options = {
	dry: false,
	print: false,
	verbose: 2,
	parser: 'tsx',
};

jscodeshift( transformPath, paths, options )
	.then( ( results ) => {
		if ( results.error ) {
			console.error( results.error );
			process.exit( 1 );
		}
		console.log( 'Transform complete:', results );
	} )
	.catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} );
