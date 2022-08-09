import fs from 'fs';
import path from 'path';
import v8Profiler from 'v8-profiler-next';

export default () => {
	let IS_PROFILING = false;

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
			IS_PROFILING ||
			! req.originalUrl.startsWith( '/' ) ||
			req.originalUrl.startsWith( '/calypso/' ) ||
			req.originalUrl.startsWith( '/service-worker' ) ||
			req.originalUrl.startsWith( '/nostats.js' ) ||
			req.originalUrl.startsWith( '/version' )
		) {
			next();
			return;
		}
		IS_PROFILING = true;

		// Replace slash with underscore:
		const profileName = req.originalUrl.replace( /\//g, '_' );

		v8Profiler.startProfiling( profileName, true );

		// Once the request finishes, save the profile data to a file.
		res.on( 'close', () => {
			IS_PROFILING = false;
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
