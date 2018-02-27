/** @format */
/**
 * External dependecies
 */

const webpackMiddleware = require( 'webpack-dev-middleware' );
const webpack = require( 'webpack' );
const chalk = require( 'chalk' );
const hotMiddleware = require( 'webpack-hot-middleware' );
const webpackConfig = require( 'webpack.config' );

const config = require( 'config' );

const port = process.env.PORT || config( 'port' );

function middleware( app ) {
	const compiler = webpack( webpackConfig );
	const callbacks = [];
	let built = false;
	let beforeFirstCompile = true;

	app.use( hotMiddleware( compiler ) );

	app.set( 'compiler', compiler );

	compiler.apply(
		new webpack.ProgressPlugin( {
			profile: true,
		} )
	);

	compiler.plugin( 'done', function() {
		built = true;

		// Dequeue and call request handlers
		while ( callbacks.length > 0 ) {
			callbacks.shift()();
		}

		// In order to show our message *after* webpack's "bundle is now VALID"
		// we need to skip two event loop ticks, because webpack's callback is
		// also hooked on the "done" event, it calls nextTick to print the message
		// and runs before our callback (calls app.use earlier in the code)
		process.nextTick( function() {
			process.nextTick( function() {
				if ( beforeFirstCompile ) {
					beforeFirstCompile = false;
					console.info(
						chalk.cyan( `\nReady! You can load http://calypso.localhost:${ port }/ now. Have fun!` )
					);
				} else {
					console.info( chalk.cyan( '\nReady! All assets are re-compiled. Have fun!' ) );
				}
			} );
		} );
	} );

	function waitForCompiler( request, response, next ) {
		if ( built ) {
			return next();
		}

		console.info(
			'Compiling assets... Wait until you see Ready! and then try http://calypso.localhost:3000/ again.'
		);

		// a special message for newcomers, because seeing a blank page is confusing
		if ( request.url === '/' ) {
			response.send( `
				<head>
					<meta http-equiv="refresh" content="5">
				</head>
				<body>
					<h1>Welcome to Calypso!</h1>
					<p>Please wait until webpack has finished compiling and you see <code style="font-size: 1.2em; color: blue; font-weight: bold;">READY!</code> in the server console. This page should then refresh automatically. If it hasn&rsquo;t, hit <em>Refresh</em>.</p>
					<p>In the meantime, try to follow all the emotions of the allmoji: <img src="https://emoji.slack-edge.com/T024FN1V2/allmoji/fa5781cf7a8c5685.gif" width="36" style="vertical-align: middle;">
				</body>
			` );
		} else {
			// Queue request handlers until the initial build is complete
			callbacks.push( waitForCompiler.bind( null, request, response, next ) );
		}
	}

	app.use( waitForCompiler );
	app.use(
		webpackMiddleware( compiler, {
			mode: 'development',
			publicPath: '/calypso/',
			stats: {
				colors: true,
				hash: true,
				version: false,
				timings: true,
				assets: true,
				chunks: false,
				modules: false,
				cached: false,
				reasons: false,
				source: false,
				errorDetails: true,
				entrypoints: true,
			},
		} )
	);
}

module.exports = middleware;
