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
	const { enabledSections, startDashboardDevConfig, startDashboardEntries } = runtimeRequire(
		'./build-tools/vite/dev.mjs'
	);

	app.set( 'bundler', 'vite' );

	// Stylesheets the server-rendered page needs before the scripts run. Sections load with
	// `import()`, so their chunk groups have no scripts.
	const direct = ( file ) => `/${ file }?direct`;
	const globalStyles = [ direct( 'client/assets/stylesheets/style.scss' ) ];
	const placeholderStyles = [
		'client/components/loading/style.scss',
		'packages/onboarding/src/step-container-v2/wireframes/Loading/style.scss',
		'packages/onboarding/src/step-container-v2/components/StepContainerV2/style.scss',
		'packages/onboarding/src/step-container-v2/components/TopBar/style.scss',
		'packages/onboarding/src/step-container-v2/components/Heading/style.scss',
	].map( direct );
	const omnibarStyles = [
		direct( 'packages/omnibar/src/style.scss' ),
		direct( 'client/dashboard/app/omnibar/style.scss' ),
	];
	const entryStyles = {
		'entry-main': globalStyles,
		'entry-stepper': [ ...globalStyles, ...placeholderStyles ],
		'entry-dashboard-dotcom': omnibarStyles,
		'entry-dashboard-a4a': omnibarStyles,
	};
	const assets = { manifests: [], assets: {} };
	for ( const [ name, file ] of Object.entries( startDashboardEntries ) ) {
		assets.assets[ name ] = [ ...entryStyles[ name ], '/' + file ];
	}
	for ( const { name } of enabledSections() ) {
		assets.assets[ name ] = [ 'checkout', 'signup' ].includes( name ) ? placeholderStyles : [];
	}
	app.set( 'assets-provider', () => assets );

	const vite = new Promise( ( resolve ) => app.once( 'http-server-created', resolve ) )
		.then( ( httpServer ) => createServer( startDashboardDevConfig( { httpServer } ) ) )
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
