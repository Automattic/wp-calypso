/** @format */
const webpack = require( 'webpack' );
const config = require( '../webpack.config' );
const _ = require( 'lodash' );
const fs = require( 'fs' );
const path = require( 'path' );

config.profile = true;
compiler = webpack( config, ( err, stats ) => {
	if ( err || stats.hasErrors() ) {
		// Handle errors here
		console.error( err );
	}
	const out = stats.toJson( { source: false, reasons: false, issuer: false, timings: true } );
	fs.writeFileSync( path.join( __dirname, '..', 'stats.json' ), JSON.stringify( out, null, '\t' ) );
} );
