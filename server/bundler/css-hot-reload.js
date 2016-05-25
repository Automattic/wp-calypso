/**
 * Module dependencies
 */
var os = require( 'os' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	spawn = require( 'child_process' ).spawn,
	debug = require( 'debug' )( 'css-hot-reload' ),
	chalk = require( 'chalk' ),
	chokidar = require('chokidar'),
	md5File = require('md5-file');

/**
 * Initialize server CSS hot-reloading logic
 */
function setup( io ) {

	const SCSS_PATHS = [ './assets/stylesheets/', './client/' ];
	const ROOT_DIR = path.resolve( __dirname, '..', '..' );
	const PUBLIC_DIR = path.join( ROOT_DIR, 'public' );

	var cssMake = null,
		cores = os.cpus().length,
		errors = '',
		scheduleBuild = false,
		publicCssFiles = {}; // { path, hash } dictionary

	function spawnMake() {
		// If a build is already in progress schedule another build for later
		if ( cssMake ) {
			scheduleBuild = true;
			return;
		}

		io.of( '/css-hot-reload' ).emit( 'css-hot-reload', 
			{ status: 'building' } );

		debug( 'spawning %o', 'make build-css --jobs ' + cores );
		cssMake = spawn( 'make', [ 'build-css', '--jobs', cores ], {
			cwd: ROOT_DIR,
			stdio: [ 'ignore', 'pipe', 'pipe']
		} );

		errors = '';
		cssMake.once( 'exit', onexit );
		cssMake.stdout.setEncoding( 'utf8' );
		cssMake.stderr.setEncoding( 'utf8' );
		cssMake.stdout.on( 'data', onstdout );
		cssMake.stderr.on( 'data', onstderr );
	}

	function onstdout( d ) {
		debug( 'stdout %o', d.trim() );
	}

	function onstderr( stderr ) {
		process.stderr.write( stderr );
		errors += stderr;
	}

	/**
	 * Handle 'make build-css' success or failure
	 */
	function onexit( code ) {
		var changedFiles;

		cssMake.stderr.removeListener( 'data', onstderr );
		cssMake.stdout.removeListener( 'data', onstdout );
		cssMake = null;

		if ( scheduleBuild ) {
			// Handle new css build request
			scheduleBuild = false;
			spawnMake();
		} else if ( 0 === code ) {
			// 'make build-css' success
			changedFiles = updateChangedCssFiles();
			if ( 0 !== changedFiles.length ) {
				debug( chalk.green( 'css reload' ) );
				io.of( '/css-hot-reload' ).emit( 'css-hot-reload', 
					{ status: 'reload', changedFiles: changedFiles } );
			} else {
				debug( chalk.green( 'css up to date' ) );
				io.of( '/css-hot-reload' ).emit( 'css-hot-reload', 
					{ status: 'up-to-date' } );
			}
		} else {
			// 'make build-css' failed
			debug( chalk.red( 'css build failed' ) );
			io.of( '/css-hot-reload' ).emit( 'css-hot-reload', 
				{ status: 'build-failed', error: errors } );
		}
	}

	/**
	 * Updates the MD5 hash of the public CSS files and returns the changed ones
	 * in a list.
	 */
	function updateChangedCssFiles() {
		var hash, filePath, changedFiles = [];
		for( filePath in publicCssFiles ) {
			hash = md5File.sync( filePath );
			if ( hash !== publicCssFiles[ filePath ] ) {
				publicCssFiles[ filePath ] = hash;
				changedFiles.push( path.basename( filePath ) );
			}
		}

		return changedFiles;
	}

	// Initialize publicCssFiles
	
	fs.readdirSync( PUBLIC_DIR ).forEach( function( file ) {
		if ( '.css' === file.slice( -4 ) ) {
			var fullPath = path.join( PUBLIC_DIR, file );
			publicCssFiles[ fullPath ] = md5File.sync( fullPath );
		}
	} );
	
	// Watch .scss files

	var watcher = chokidar.watch( SCSS_PATHS, { 
		ignored: /^.*\.(js[x]?|md|json)$/,
		usePolling: false,
		persistent: true
	} );

	// The add/addDir events are fired during initialization generating an 
	// avalanche of refreshes on the client so we stick to the change events 
	// only for now until we can exclude the initial add/addDir events.
	watcher.on( 'all', function( event, path ) {
		if ( 'change' === event && path.match( /^.*\.scss$/ ) ) {
			spawnMake();
		}
	} );

}

/**
 * Module exports
 */
module.exports = setup;
