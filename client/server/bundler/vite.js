const { writeFile, mkdir } = require( 'fs/promises' );
const path = require( 'path' );
const config = require( '@automattic/calypso-config' );

const protocol = config( 'protocol' );
const host = config( 'hostname' );
const port = config( 'port' );

// Entry name → source file URL in Vite dev mode.
// Paths are relative to the project root (Vite's root), matching the entrypoints
// in client/vite.config.ts so the browser can request them from the Vite middleware.
const DEV_ENTRIES = {
	'entry-main': '/client/boot/app.js',
	'entry-domains-landing': '/client/landing/domains/index.jsx',
	'entry-login': '/client/landing/login/index.js',
	'entry-stepper': '/client/landing/stepper/index.tsx',
	'entry-browsehappy': '/client/landing/browsehappy/index.jsx',
	'entry-subscriptions': '/client/landing/subscriptions/index.tsx',
	'entry-dashboard-dotcom': '/client/dashboard/app-dotcom/index.tsx',
	'entry-dashboard-ciab': '/client/dashboard/app-ciab/index.tsx',
	'entry-reauth-required': '/client/reauth-required/bundle.js',
};

const DEV_ENTRY_STYLES = {
	'entry-main': [ '/client/assets/stylesheets/style.scss' ],
	'entry-domains-landing': [
		'/client/assets/stylesheets/style.scss',
		'/client/landing/domains/style.scss',
	],
	'entry-login': [ '/client/assets/stylesheets/style.scss' ],
	'entry-stepper': [ '/client/assets/stylesheets/style.scss' ],
	'entry-browsehappy': [
		'/client/assets/stylesheets/style.scss',
		'/client/landing/browsehappy/style.scss',
	],
	'entry-subscriptions': [ '/client/landing/subscriptions/styles/styles.scss' ],
	'entry-dashboard-dotcom': [
		'/node_modules/@wordpress/components/build-style/style.css',
		'/node_modules/@wordpress/commands/build-style/style.css',
		'/client/dashboard/app/style.scss',
		'/client/layout/masterbar/style.scss',
		'/client/dashboard/app/interim-omnibar/style.scss',
		'/client/dashboard/app/omnibar/style.scss',
		'/node_modules/@automattic/omnibar/src/style.scss',
		'/client/dashboard/app-dotcom/style.scss',
	],
	'entry-dashboard-ciab': [
		'/node_modules/@wordpress/components/build-style/style.css',
		'/node_modules/@wordpress/commands/build-style/style.css',
		'/client/dashboard/app/style.scss',
		'/client/layout/masterbar/style.scss',
		'/client/dashboard/app/interim-omnibar/style.scss',
		'/client/dashboard/app/omnibar/style.scss',
		'/node_modules/@automattic/omnibar/src/style.scss',
		'/client/dashboard/app-ciab/style.scss',
	],
	'entry-reauth-required': [ '/client/reauth-required/style.scss' ],
};

const asDirectCss = ( url ) => `${ url }?direct`;
const asDirectRtlCss = ( url ) => `${ url }?direct&rtl`;

const getDevStylesForEntry = ( entryName ) =>
	( DEV_ENTRY_STYLES[ entryName ] ?? [] ).flatMap( ( styleUrl ) => [
		asDirectCss( styleUrl ),
		asDirectRtlCss( styleUrl ),
	] );

// Write build/assets.json so the Node server knows which JS/CSS URLs to inject
// for each entry point. Vite's HMR runtime also injects imported CSS, but the initial
// document still needs stylesheet links for the dashboard shell to avoid FOUC
// before the entry module runs.
async function writeDevAssetsJson() {
	const buildDir = path.join( process.cwd(), 'build' );
	await mkdir( buildDir, { recursive: true } );
	const assets = {
		manifests: [],
		assets: Object.fromEntries(
			Object.entries( DEV_ENTRIES ).map( ( [ name, url ] ) => [
				name,
				[ url, ...getDevStylesForEntry( name ) ],
			] )
		),
	};
	await writeFile( path.join( buildDir, 'assets.json' ), JSON.stringify( assets, null, 2 ) );
}

module.exports = function middleware( app ) {
	const pending = [];
	let viteMiddleware = null;

	// Synchronously reserve Vite's position in the middleware stack. The actual
	// Vite middleware is created asynchronously, but it still needs to run before
	// Calypso's page handlers so /@vite/client and /client/* module requests are
	// handled by Vite instead of falling through to a 404 page.
	app.use( ( req, res, next ) => {
		if ( viteMiddleware ) {
			return viteMiddleware( req, res, next );
		}
		if ( req.url === '/' ) {
			res.send( `
				<head><meta http-equiv="refresh" content="3"></head>
				<body>
					<h1>Welcome to Calypso!</h1>
					<p>Please wait while Vite is starting up. This page will refresh automatically.</p>
				</body>
			` );
		} else {
			pending.push( () => viteMiddleware( req, res, next ) );
		}
	} );

	( async () => {
		await writeDevAssetsJson();

		const { createServer } = await import( 'vite' );
		const vite = await createServer( {
			configFile: path.join( process.cwd(), 'client', 'vite.config.ts' ),
			server: { middlewareMode: true },
			appType: 'custom',
		} );

		viteMiddleware = vite.middlewares;
		for ( const resume of pending.splice( 0 ) ) {
			resume();
		}

		process.nextTick( () => {
			process.nextTick( () => {
				console.info( `\nReady! You can load ${ protocol }://${ host }:${ port }/ now. Have fun!` );
			} );
		} );
	} )().catch( ( err ) => {
		console.error( 'Vite dev server failed to start:', err );
		process.exit( 1 );
	} );
};
