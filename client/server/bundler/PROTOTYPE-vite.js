// PROTOTYPE (DOTMSD-1679): Vite 8.3 in middleware mode inside Express (DOTMSD-1655), serving the
// Dashboard entries plus entry-main and entry-stepper. Throwaway.
const { createRequire } = require( 'module' );
const path = require( 'path' );
const config = require( '@automattic/calypso-config' );

// The server bundle must not follow these: load them from the repo at runtime.
const runtimeRequire = createRequire( path.join( process.cwd(), 'package.json' ) );

module.exports = function viteMiddleware( app ) {
	let vite = null;
	const pending = [];
	let resolveHttpServer;
	const httpServerReady = new Promise( ( resolve ) => ( resolveHttpServer = resolve ) );
	app.locals.onHttpServer = ( server ) => resolveHttpServer( server );

	app.use( ( req, res, next ) => {
		if ( vite ) {
			return vite.middlewares( req, res, next );
		}
		pending.push( () => vite.middlewares( req, res, next ) );
	} );

	( async () => {
		const t0 = performance.now();
		const httpServer = await httpServerReady;
		const { createServer } = runtimeRequire( 'vite' );
		const { startDashboardDevConfig } = runtimeRequire( './build-tools/vite/dev.mjs' );
		const sections = config( 'sections' ) ?? {};
		vite = await createServer(
			startDashboardDevConfig( {
				httpServer,
				isSectionEnabled: ( s ) => sections[ s.name ] ?? config( 'enable_all_sections' ),
			} )
		);
		for ( const resume of pending.splice( 0 ) ) {
			resume();
		}
		console.info(
			`[prototype] Vite ready in ${ ( performance.now() - t0 ).toFixed( 0 ) }ms (${ performance
				.now()
				.toFixed( 0 ) }ms since process start)`
		);
	} )().catch( ( err ) => {
		console.error( 'Vite dev server failed to start:', err );
		process.exit( 1 );
	} );
};
