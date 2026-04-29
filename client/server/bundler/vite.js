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

// Write build/assets.json so the Node server knows which JS URL to inject for each
// entry point. CSS is injected via Vite's HMR runtime in dev mode (no separate files).
async function writeDevAssetsJson() {
	const buildDir = path.join( process.cwd(), 'build' );
	await mkdir( buildDir, { recursive: true } );
	const assets = {
		manifests: [],
		viteDev: true,
		assets: Object.fromEntries(
			Object.entries( DEV_ENTRIES ).map( ( [ name, url ] ) => [ name, [ url ] ] )
		),
	};
	await writeFile( path.join( buildDir, 'assets.json' ), JSON.stringify( assets, null, 2 ) );
}

module.exports = function middleware( app ) {
	const pending = [];
	let ready = false;

	// Synchronously add a wait middleware so no requests slip past before Vite is ready.
	app.use( ( req, res, next ) => {
		if ( ready ) {
			return next();
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
			pending.push( next );
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

		app.use( vite.middlewares );

		ready = true;
		for ( const next of pending.splice( 0 ) ) {
			next();
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
