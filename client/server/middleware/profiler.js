const fs = require( 'fs' );
const path = require( 'path' );
const chalk = require( 'chalk' );
const v8Profiler = require( 'v8-profiler-next' );

/**
 * This should be dynamically imported:
 *
 * if ( shouldProfile ) {
 *   app.use ( require( 'calypso/server/middleware/profiler' )() )
 * }
 *
 * to avoid importing v8-profiler-next in production environments.
 */
module.exports = () => {
	console.info(
		chalk.cyan(
			'\nRunning server with CPU profiler enabled. Profiles for each request are written to ./profiles'
		)
	);

	// Log about request.
	let isProfiling = false;

	// Generates a CPU profile compatible with VS Code's viewer.
	v8Profiler.setGenerateType( 1 );

	const profilesRoot = path.resolve(
		path.join( __dirname, '../../../profiles', new Date().toISOString() )
	);
	try {
		fs.accessSync( profilesRoot );
	} catch {
		fs.mkdirSync( profilesRoot, { recursive: true } );
	}

	return ( req, res, next ) => {
		// Avoid profiling certain requests (like for static files) and don't
		// start profiling if we already are.
		if (
			isProfiling ||
			! req.originalUrl.startsWith( '/' ) ||
			req.originalUrl.startsWith( '/calypso/' ) ||
			req.originalUrl.startsWith( '/service-worker' ) ||
			req.originalUrl.startsWith( '/nostats.js' ) ||
			req.originalUrl.startsWith( '/version' ) ||
			req.originalUrl.startsWith( '/__webpack_hmr' )
		) {
			next();
			return;
		}
		isProfiling = true;

		// Replace slash with underscore:
		const profileName = req.originalUrl.replace( /\//g, '_' );

		v8Profiler.startProfiling( profileName, true );

		// Once the request finishes, save the profile data to a file.
		res.on( 'close', () => {
			isProfiling = false;
			const profile = v8Profiler.stopProfiling( profileName );

			profile.export( ( error, result ) => {
				if ( error ) {
					console.error( error );
					return;
				}
				fs.writeFile( `${ profilesRoot }/${ profileName }.cpuprofile`, result, ( err ) => {
					if ( err ) {
						console.error( 'Something wrent wrong writing the CPU profile file.' );
						console.log( err );
					}
				} );
			} );
			profile.delete();
		} );

		next();
	};
};
