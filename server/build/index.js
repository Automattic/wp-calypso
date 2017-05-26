/**
 * Module dependencies
 */
var path = require( 'path' ),
	spawn = require( 'child_process' ).spawn,
	debug = require( 'debug' )( 'build' );

/**
 * Returns a "build middleware", which runs `make build-css` upon each HTTP
 * request. Meant for use in "development" env.
 *
 * @return {Function} build middleware function
 * @public
 */
function setup() {

	var build = null,
		errors = '',
		rootdir = path.resolve( __dirname, '..', '..' );

	function spawnMake() {
		debug( 'spawning %o', 'npm run build-css' );
		build = spawn( 'npm', [ 'run', 'build-css' ], {
			shell: true,
			cwd: rootdir,
			stdio: [ 'ignore', 'pipe', 'pipe']
		} );
		errors = '';
		build.once( 'exit', onexit );
		build.stdout.setEncoding( 'utf8' );
		build.stdout.on( 'data', onstdout );
		build.stderr.on( 'data', onstderr );
	}

	function onstdout( d ) {
		debug( 'stdout %o', d.trim() );
	}

	function onexit() {
		build.stderr.removeListener( 'data', onstderr );
		build.stdout.removeListener( 'data', onstdout );
		build = null;
	}

	function onstderr( stderr ) {
		process.stderr.write( stderr.toString( 'utf8' ) );
		errors += stderr.toString( 'utf8' );
	}

	return function ( req, res, next ) {

		if ( ! build ) {
			spawnMake();
		}

		build.once( 'exit', function( code ) {
			if ( 0 === code ) {
				// `make` success
				next();
			} else {
				// `make` failed
				res.send( '<pre>`make build-css` failed \n\n' + errors + '</pre>' );
			}
		} );
	};
}

/**
 * Module exports
 */
module.exports = setup;
