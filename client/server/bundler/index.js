const { execSync } = require( 'child_process' );
const config = require( '@automattic/calypso-config' );
const chalk = require( 'chalk' );
const webpack = require( 'webpack' );
const webpackMiddleware = require( 'webpack-dev-middleware' );
const hotMiddleware = require( 'webpack-hot-middleware' );
const webpackConfig = require( 'calypso/webpack.config' );
const { stopDevBootSpinner } = require( '../lib/dev-boot-spinner.js' );

if ( process.env.CALYPSO_TIME_START === 'true' && globalThis.__calypsoStartClockMs != null ) {
	console.error(
		'[calypso-time] bundler module loaded (incl. webpack.config): %dms\n',
		Date.now() - globalThis.__calypsoStartClockMs
	);
}

const protocol = config( 'protocol' );
const host = config( 'hostname' );
const port = config( 'port' );
const shouldProfile = process.env.PROFILE === 'true';
const shouldBuildChunksMap =
	process.env.BUILD_TRANSLATION_CHUNKS === 'true' ||
	process.env.ENABLE_FEATURES === 'use-translation-chunks';

const COMPILE_SPINNER_FRAMES = [ '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏' ];

/** Rotate ~every 8s at 90ms/tick (90 * 89 ≈ 8s). */
const COMPILE_ASIDES = [
	'Webpack is thinking.',
	'This is the slow part.',
	'Making chunks.',
	'Source maps take a sec.',
	'The caches help next time.',
	'Almost there maybe.',
];

function shortWebpackProgressMsg( message ) {
	if ( ! message ) {
		return '';
	}
	return message.length > 40 ? message.slice( 0, 37 ) + '…' : message;
}

function middleware( app ) {
	const tWebpack = Date.now();
	const compiler = webpack( webpackConfig );
	if ( process.env.CALYPSO_TIME_START === 'true' ) {
		console.error( '[calypso-time] webpack( config ) (sync): %dms\n', Date.now() - tWebpack );
	}
	const callbacks = [];
	let built = false;
	let beforeFirstCompile = true;
	let compileSpinnerTimer = null;
	let compileSpinnerFrame = 0;
	let compileWaitMessageLogged = false;
	/** Webpack’s reported % can go backward between phases; display only ever rises. */
	let compileProgressHighWater = 0;
	let compileProgressMessage = '';

	let compileStartTime = 0;

	function stopCompileSpinner() {
		const wasRunning = compileSpinnerTimer != null;
		if ( compileSpinnerTimer ) {
			clearInterval( compileSpinnerTimer );
			compileSpinnerTimer = null;
		}
		if ( wasRunning ) {
			const elapsed = Math.round( ( Date.now() - compileStartTime ) / 1000 );
			const timeStr = elapsed > 0 ? ` · ${ elapsed }s` : '';
			const done = chalk.green( '✓' ) + ' ' + chalk.gray( '100% · Done' + timeStr ) + '\n';
			if ( process.stderr.isTTY ) {
				process.stderr.write( '\r\x1b[2K' + done );
			} else {
				process.stderr.write( done );
			}
		}
	}

	function startCompileSpinner() {
		stopDevBootSpinner();
		stopCompileSpinner();
		compileSpinnerFrame = 0;
		compileProgressHighWater = 0;
		compileProgressMessage = '';
		if ( process.env.CI === 'true' || ! process.stderr.isTTY ) {
			return;
		}
		const stream = process.stderr;
		const showAsides = process.env.CALYPSO_COMPILE_SNARK !== '0';
		compileStartTime = Date.now();
		const tick = function () {
			const glyph = COMPILE_SPINNER_FRAMES[ compileSpinnerFrame % COMPILE_SPINNER_FRAMES.length ];
			compileSpinnerFrame++;
			const elapsed = Math.round( ( Date.now() - compileStartTime ) / 1000 );
			const elapsedStr = elapsed > 0 ? `${ elapsed }s` : '';

			const pctPart =
				compileProgressHighWater > 0 || compileProgressMessage
					? `${ Math.round( compileProgressHighWater * 100 ) }%` +
					  ( compileProgressMessage
							? ` · ${ shortWebpackProgressMsg( compileProgressMessage ) }`
							: '' )
					: 'Compiling…';

			const aside = showAsides
				? COMPILE_ASIDES[ Math.floor( compileSpinnerFrame / 89 ) % COMPILE_ASIDES.length ]
				: '';

			const grayParts = [ pctPart, elapsedStr ].filter( Boolean );
			const rest =
				chalk.gray( grayParts.join( ' · ' ) ) +
				( aside ? chalk.gray( ' · ' ) + chalk.white( aside ) : '' );

			stream.write( '\r\x1b[2K' + glyph + ' ' + rest );
		};
		tick();
		compileSpinnerTimer = setInterval( tick, 90 );
	}

	app.set( 'compiler', compiler );

	compiler.hooks.compile.tap( 'CalypsoCompileSpinner', function () {
		if ( process.env.CALYPSO_TIME_START === 'true' ) {
			const t0 = globalThis.__calypsoStartClockMs;
			const ms = t0 != null ? Date.now() - t0 : -1;
			console.error( '[calypso-time] webpack compile started: %dms since server entry\n', ms );
		}
		startCompileSpinner();
	} );

	if ( shouldProfile ) {
		new compiler.webpack.ProgressPlugin( { profile: true } ).apply( compiler );
	} else if ( process.env.NODE_ENV === 'development' && process.env.CI !== 'true' ) {
		new compiler.webpack.ProgressPlugin( ( percentage, message ) => {
			compileProgressHighWater = Math.max( compileProgressHighWater, percentage );
			compileProgressMessage = message || '';
		} ).apply( compiler );
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
		stopCompileSpinner();
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
					process.stderr.write(
						chalk.white( 'Ready! ' ) +
							chalk.hex( '#21759b' )( `${ protocol }://${ host }:${ port }/` ) +
							'\n'
					);
				} else {
					process.stderr.write(
						chalk.white( 'Ready! ' ) +
							chalk.hex( '#21759b' )( 'Fresh assets — keep hacking.' ) +
							'\n'
					);
				}
			} );
		} );
	} );

	function waitForCompiler( request, response, next ) {
		if ( built ) {
			return next();
		}

		if ( ! compileWaitMessageLogged ) {
			compileWaitMessageLogged = true;
			process.stderr.write(
				'\r\x1b[2K' +
					chalk.gray(
						`Waiting for the first compile… When you see Ready!, try ${ protocol }://${ host }:${ port }/ again.\n`
					)
			);
		}

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

	const devMiddlewareOptions = {
		publicPath: compiler.options.output.publicPath,
		...( process.env.CALYPSO_WEBPACK_LOG === 'verbose' ? {} : { stats: 'errors-warnings' } ),
	};

	app.use( waitForCompiler );
	app.use( webpackMiddleware( compiler, devMiddlewareOptions ) );
	app.use( hotMiddleware( compiler ) );
}

module.exports = middleware;
