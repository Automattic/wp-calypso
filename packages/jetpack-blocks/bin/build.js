/* eslint-disable no-console, import/no-nodejs-modules, no-process-exit */

process.env.TARGET_BROWSER = 'true';

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const webpack = require( 'webpack' );
const path = require( 'path' );

const watchMode = process.argv.includes( '--watch' ) | process.argv.includes( '-w' );

function build() {
	const getConfig = require( path.join( __dirname, '..', 'webpack.config' ) );
	const compiler = webpack( getConfig() );

	// watch takes an additional argument, adjust accordingly
	const runner = f => ( watchMode ? compiler.watch( {}, f ) : compiler.run( f ) );

	runner( ( error, stats ) => {
		if ( error ) {
			console.error( error );
			console.log( chalk.red( 'Failed to build' ) );
			process.exit( 1 );
		}

		console.log( stats.toString() );

		if ( stats.hasErrors() ) {
			console.log( chalk.red( 'Built with errors' ) );
		} else if ( stats.hasWarnings() ) {
			console.log( chalk.yellow( 'Built with warnings' ) );
		} else {
			console.log( chalk.green( 'Built successfully' ) );
		}
	} );
}

build();
