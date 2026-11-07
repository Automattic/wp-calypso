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

	// PROTOTYPE (DOTMSD-1682): static CSS closures for server-rendered pages.
	let resolveSectionCss;
	globalThis.__viteSectionCss = new Promise( ( resolve ) => ( resolveSectionCss = resolve ) );
	app.use( '/@calypso/combined-css', async ( req, res, next ) => {
		try {
			const sectionCss = await globalThis.__viteSectionCss;
			const { entries, exclude } = JSON.parse( req.query.k );
			res.type( 'text/css' ).send( await sectionCss.combined( entries, exclude ) );
		} catch ( e ) {
			next( e );
		}
	} );

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
		const { startDashboardDevConfig, startDevConfig } = runtimeRequire(
			'./build-tools/vite/dev.mjs'
		);
		const makeConfig = process.env.CALYPSO_VITE_ALL ? startDevConfig : startDashboardDevConfig;
		const sections = config( 'sections' ) ?? {};
		vite = await createServer(
			makeConfig( {
				httpServer,
				isSectionEnabled: ( s ) => sections[ s.name ] ?? config( 'enable_all_sections' ),
			} )
		);
		const { createSectionCss } = runtimeRequire(
			'./client/server/bundler/PROTOTYPE-section-css.mjs'
		);
		const sectionCss = createSectionCss( vite );
		resolveSectionCss( sectionCss );
		for ( const resume of pending.splice( 0 ) ) {
			resume();
		}
		if ( process.env.CALYPSO_VITE_SECTION_CSS === 'startup' ) {
			const t1 = performance.now();
			const sectionsList = runtimeRequire( './client/sections.js' ).filter(
				( s ) => sections[ s.name ] ?? config( 'enable_all_sections' )
			);
			const boot = [ '/client/boot/app.js' ];
			await sectionCss.cssFor( boot );
			for ( const s of sectionsList ) {
				const url = await sectionCss.resolveUrl( s.module );
				if ( url ) {
					await sectionCss.cssFor( [ url ], boot );
				}
			}
			console.info(
				`[prototype] start-up CSS crawl of ${ sectionsList.length } sections in ${ (
					performance.now() - t1
				).toFixed( 0 ) }ms (${ sectionCss.stats.transformed } modules)`
			);
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
