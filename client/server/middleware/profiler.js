const fs = require( 'fs' );
const path = require( 'path' );
const chalk = require( 'chalk' );
const v8Profiler = require( 'v8-profiler-next' );
const { default: isStaticRequest } = require( 'calypso/server/lib/is-static-request' );

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
		chalk.blueBright(
			'\nRunning server with CPU profiler enabled. Profiles for each request are written to ./profiles\n'
		)
	);

	// Log about request.
	let isProfiling = false;

	// Generates a CPU profile compatible with VS Code's viewer.
	v8Profiler.setGenerateType( 1 );

	const profilesRoot = path.resolve( path.join( __dirname, '../../../profiles' ) );

	return ( req, res, next ) => {
		// Avoid profiling certain requests (like for static files) and don't
		// start profiling if we already are.
		if ( isProfiling || ! req.originalUrl.startsWith( '/' ) || isStaticRequest( req ) ) {
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
					console.error( chalk.red( 'Something wrent wrong generating the CPU profile.' ) );
					console.error( error );
					return;
				}

				const requestProfileDir = path.join( profilesRoot, profileName );
				try {
					fs.accessSync( requestProfileDir );
				} catch {
					fs.mkdirSync( requestProfileDir, { recursive: true } );
				}

				const profileFileName = path.join(
					requestProfileDir,
					`${ profileName }-${ new Date().toISOString() }.cpuprofile`
				);

				fs.writeFile( profileFileName, result, ( err ) => {
					if ( err ) {
						console.error( chalk.red( 'Something wrent wrong writing the CPU profile file.' ) );
						console.error( err );
						return;
					}
					console.log(
						chalk.blueBright( `Successfully wrote CPU profile to ${ profileFileName }` )
					);
				} );
			} );
			profile.delete();
		} );

		next();
	};
};
