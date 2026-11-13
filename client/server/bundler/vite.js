const { createRequire } = require( 'module' );
const path = require( 'path' );

const runtimeRequire = createRequire( path.join( process.cwd(), 'package.json' ) );

/**
 * Serves the client from Vite in middleware mode, as `calypso/server/bundler` does with webpack.
 * Requests wait until Vite is ready, and Vite waits for the HTTP server to share its port for HMR.
 * @param {import('express').Express} app
 */
module.exports = function viteBundler( app ) {
	const { createServer } = runtimeRequire( 'vite' );
	const { dashboardDevConfig, dashboardEntries } = runtimeRequire( './build-tools/vite/dev.mjs' );

	app.set( 'bundler', 'vite' );

	const omnibarStyles = [
		'/packages/omnibar/src/style.scss?direct',
		'/client/dashboard/app/omnibar/style.scss?direct',
	];
	const assets = { manifests: [], assets: {} };
	for ( const [ name, file ] of Object.entries( dashboardEntries ) ) {
		assets.assets[ name ] = [ ...omnibarStyles, '/' + file ];
	}
	app.set( 'assets-provider', () => assets );

	const vite = new Promise( ( resolve ) => app.once( 'http-server-created', resolve ) )
		.then( ( httpServer ) => createServer( dashboardDevConfig( { httpServer } ) ) )
		.catch( ( error ) => {
			console.error( 'The Vite dev server failed to start:', error );
			process.exit( 1 );
		} );

	app.use( ( req, res, next ) => {
		// The request logger skips what Vite serves: a page load makes thousands of module requests.
		res.locals.servedByBundler = true;
		const passOn = ( error ) => {
			res.locals.servedByBundler = false;
			next( error );
		};
		vite.then( ( server ) => server.middlewares( req, res, passOn ), passOn );
	} );
};
