/**
 * External dependencies
 */

/* eslint-disable import/no-extraneous-dependencies */
const webpackMiddleware = require( 'webpack-dev-middleware' );
const webpack = require( 'webpack' );
const hotMiddleware = require( 'webpack-hot-middleware' );
/* eslint-enable import/no-extraneous-dependencies */

const chalk = require( 'chalk' );
const webpackConfig = require( 'webpack.config' );
const { execSync } = require( 'child_process' );

const config = require( 'config' );

const protocol = process.env.PROTOCOL || config( 'protocol' );
const host = process.env.HOST || config( 'hostname' );
const port = process.env.PORT || config( 'port' );
const shouldProfile = process.env.PROFILE === 'true';
const shouldBuildChunksMap =
	process.env.BUILD_TRANSLATION_CHUNKS === 'true' ||
	process.env.ENABLE_FEATURES === 'use-translation-chunks';

function middleware( app ) {
	const compiler = webpack( webpackConfig );
	const callbacks = [];
	let built = false;
	let beforeFirstCompile = true;

	app.use( hotMiddleware( compiler ) );

	app.set( 'compiler', compiler );

	if ( shouldProfile ) {
		compiler.apply(
			new webpack.ProgressPlugin( {
				profile: true,
			} )
		);
	}

	// In development environment we need to wait for initial webpack compile
	// to finish and execute the build-languages script if translation chunks
	// feature is enabled.
	if ( shouldBuildChunksMap ) {
		callbacks.push( () => {
			execSync( 'yarn run build-languages' );
		} );
	}

	compiler.hooks.done.tap( 'Calypso', function () {
		built = true;

		// Dequeue and call request handlers
		while ( callbacks.length > 0 ) {
			callbacks.shift()();
		}

		// In order to show our message *after* webpack's "bundle is now VALID"
		// we need to skip two event loop ticks, because webpack's callback is
		// also hooked on the "done" event, it calls nextTick to print the message
		// and runs before our callback (calls app.use earlier in the code)
		process.nextTick( function () {
			process.nextTick( function () {
				if ( beforeFirstCompile ) {
					beforeFirstCompile = false;
					console.info(
						chalk.cyan(
							`\nReady! You can load ${ protocol }://${ host }:${ port }/ now. Have fun!`
						)
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
			`Compiling assets... Wait until you see Ready! and then try ${ protocol }://${ host }:${ port }/ again.`
		);

		// a special message for newcomers, because seeing a blank page is confusing
		if ( request.url === '/' ) {
			response.send( `
				<head>
					<meta http-equiv="refresh" content="5">
				</head>
				<body>
					<h1>Welcome to Calypso!</h1>
					<p>
						Please wait until webpack has finished compiling and you see
						<code style="font-size: 1.2em; color: blue; font-weight: bold;">READY!</code> in
						the server console. This page should then refresh automatically. If it hasn&rsquo;t, hit <em>Refresh</em>.
					</p>
					<p>
						In the meantime, try to follow all the emotions of the allmoji:
						<img src="https://emoji.slack-edge.com/T024FN1V2/allmoji/15b93529a828705f.gif"
							width="36" style="vertical-align: middle;">
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
			publicPath: `/calypso/${ process.env.DEV_TARGET || 'evergreen' }/`,
			stats: {
				colors: true,
				hash: true,
				version: false,
				timings: true,
				assets: false,
				chunks: false,
				modules: false,
				cached: false,
				reasons: false,
				source: false,
				errorDetails: true,
				entrypoints: false,
			},
		} )
	);
}

module.exports = middleware;
