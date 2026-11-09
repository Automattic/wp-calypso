#!/usr/bin/env node
/**
 * Opens a page of the local dev server as a logged-in user and reports what it shows.
 *
 *   node browse.cjs <url> [options]
 *
 * <url> is absolute, or a path on the dashboard (http://my.localhost:$PORT).
 * The options are documented in ../SKILL.md.
 */
const fs = require( 'node:fs' );
const { parseArgs } = require( 'node:util' );
const {
	AUTH_COMMAND,
	OWN_ACCOUNT,
	PORT,
	UserActionRequired,
	isLoginUrl,
	launchBrowser,
	logInTestAccount,
	statePath,
} = require( './lib.cjs' );

const { values: options, positionals } = parseArgs( {
	allowPositionals: true,
	options: {
		as: { type: 'string', default: 'defaultUser' },
		'wait-for': { type: 'string' },
		eval: { type: 'string' },
		'eval-file': { type: 'string' },
		screenshot: { type: 'string' },
		'full-page': { type: 'boolean', default: false },
		'no-snapshot': { type: 'boolean', default: false },
		viewport: { type: 'string', default: '1440x1000' },
		settle: { type: 'string', default: '2000' },
		'log-requests': { type: 'string' },
	},
} );

const AsyncFunction = async function () {}.constructor;

// Spinners, the dashboard's loading bar and blurred placeholder text, busy regions, and
// Calypso's W logo shown until its JavaScript loads.
const LOADING_SELECTOR = [
	'.components-spinner',
	'.wpcom-site__logo',
	'.loading-line-bar',
	'.dashboard-text-blur--is-blurred',
	'[aria-busy="true"]',
].join( ', ' );
const LOADING_TIMEOUT = 60000;
// A spinner may only mount once the first render has fired its queries.
const LOADING_QUIET_PERIOD = 1000;

const BUILD_TIMEOUT = 90000;

/**
 * Until the first webpack build finishes, the dev server answers `/` with a "please wait"
 * page and holds every other request.
 */
async function waitForDevServer() {
	const deadline = Date.now() + BUILD_TIMEOUT;
	let announced = false;
	for (;;) {
		let body;
		try {
			body = await ( await fetch( `http://127.0.0.1:${ PORT }/` ) ).text();
		} catch {
			throw new UserActionRequired(
				`The dev server isn't running on port ${ PORT }. Start it with ` +
					'`yarn start-dashboard` (Dashboard only) or `yarn start` (all of Calypso).'
			);
		}
		if ( ! body.includes( 'webpack has finished compiling' ) ) {
			return;
		}
		if ( Date.now() > deadline ) {
			throw new UserActionRequired(
				'The dev server is still compiling its first build. ' +
					'Wait until it prints "Ready!", then run this again.'
			);
		}
		if ( ! announced ) {
			console.log( 'dev server: compiling its first build, waiting…' );
			announced = true;
		}
		await new Promise( ( resolve ) => setTimeout( resolve, 5000 ) );
	}
}

async function ensureState( account ) {
	if ( fs.existsSync( statePath( account ) ) ) {
		return;
	}
	if ( account === OWN_ACCOUNT ) {
		throw new UserActionRequired(
			'No saved login for the user. Ask them to log in once with: ' + AUTH_COMMAND
		);
	}
	console.log( `Logging in ${ account }…` );
	await logInTestAccount( account );
}

// Keeps both ends of a long message: React errors end with the component tree that failed.
function clip( text, head = 300, tail = 800 ) {
	return text.length > head + tail ? `${ text.slice( 0, head ) } … ${ text.slice( -tail ) }` : text;
}

function watch( page ) {
	const problems = [];
	const requests = [];
	const logPattern = options[ 'log-requests' ] && new RegExp( options[ 'log-requests' ] );
	page.on( 'console', ( message ) => {
		if ( message.type() === 'error' ) {
			problems.push( `console: ${ clip( message.text() ) }` );
		}
	} );
	page.on( 'pageerror', ( error ) => problems.push( `pageerror: ${ clip( error.message ) }` ) );
	page.on( 'response', async ( response ) => {
		const url = response.url();
		const logged = logPattern?.test( url );
		if ( ! logged && ! /localhost|wordpress\.com/.test( url ) ) {
			return;
		}
		let status = String( response.status() );
		if ( response.status() >= 400 ) {
			problems.push( `http ${ response.status() }: ${ url.slice( 0, 200 ) }` );
		} else if ( /[?&](http_envelope|_envelope)=1/.test( url ) ) {
			// Most API calls use http_envelope, which reports the real status in the body.
			try {
				const body = await response.json();
				status += ` (envelope ${ body.code })`;
				if ( Number( body.code ) >= 400 ) {
					const error = body.body?.error ?? body.body?.code ?? '';
					problems.push( `api ${ body.code } ${ error }: ${ url.slice( 0, 200 ) }` );
				}
			} catch {}
		}
		if ( logged ) {
			requests.push( `${ status } ${ response.request().method() } ${ url.slice( 0, 200 ) }` );
		}
	} );
	return { problems, requests };
}

async function mainContent( page ) {
	const main = page.locator( 'main' ).first();
	return ( await main.count() ) ? main : page.locator( 'body' );
}

/**
 * Waits until no loading indicator has been visible in the main content for a short while.
 * Returns the indicators still showing when it gives up.
 */
async function waitUntilLoaded( page ) {
	const root = await mainContent( page );
	const indicators = root.locator( LOADING_SELECTOR ).filter( { visible: true } );
	const deadline = Date.now() + LOADING_TIMEOUT;
	let clearSince = Date.now();
	while ( Date.now() < deadline ) {
		if ( await indicators.count() ) {
			clearSince = Date.now();
		} else if ( Date.now() - clearSince >= LOADING_QUIET_PERIOD ) {
			return [];
		}
		await page.waitForTimeout( 200 );
	}
	return indicators.evaluateAll( ( elements ) =>
		elements.map(
			( element ) =>
				element.tagName.toLowerCase() +
				[ ...element.classList ].map( ( name ) => `.${ name }` ).join( '' )
		)
	);
}

async function open( browser, account, url ) {
	const [ width, height ] = options.viewport.split( 'x' ).map( Number );
	const context = await browser.newContext( {
		storageState: statePath( account ),
		viewport: { width, height },
	} );
	const page = await context.newPage();
	const { problems, requests } = watch( page );
	await page.goto( url, { waitUntil: 'load', timeout: 60000 } );
	// The dashboard checks the session client-side, so a rejected one redirects after load.
	await Promise.race( [
		page.waitForURL( ( current ) => isLoginUrl( current.toString() ), { timeout: 30000 } ),
		page.getByRole( 'heading', { level: 1 } ).first().waitFor( { timeout: 30000 } ),
	] ).catch( () => {} );
	return { context, page, problems, requests };
}

async function main() {
	const [ target ] = positionals;
	if ( ! target ) {
		throw new UserActionRequired( 'Usage: node browse.cjs <url> [options]' );
	}
	const url = new URL( target, `http://my.localhost:${ PORT }` ).toString();
	const account = options.as;

	await waitForDevServer();
	console.log( `dev server: up on port ${ PORT }` );
	await ensureState( account );

	const browser = await launchBrowser();
	try {
		let { context, page, problems, requests } = await open( browser, account, url );

		if ( isLoginUrl( page.url() ) && ! isLoginUrl( url ) ) {
			if ( account === OWN_ACCOUNT ) {
				throw new UserActionRequired(
					'The saved login has expired. Ask the user to log in again with: ' + AUTH_COMMAND
				);
			}
			console.log( `The ${ account } session has expired. Logging in again…` );
			await context.close();
			await logInTestAccount( account );
			( { context, page, problems, requests } = await open( browser, account, url ) );
			if ( isLoginUrl( page.url() ) ) {
				throw new Error(
					`Still redirected to the login page after logging in ${ account } again.`
				);
			}
		}

		const waitFor = options[ 'wait-for' ];
		if ( waitFor ) {
			await page.locator( waitFor ).first().waitFor( { timeout: 60000 } );
		}

		const code =
			options.eval ??
			( options[ 'eval-file' ] && fs.readFileSync( options[ 'eval-file' ], 'utf8' ) );
		if ( code ) {
			await waitUntilLoaded( page );
			const result = await new AsyncFunction( 'page', 'context', code )( page, context );
			if ( result !== undefined ) {
				console.log(
					'eval result:',
					typeof result === 'string' ? result : JSON.stringify( result, null, 2 )
				);
			}
		}

		const stillLoading = await waitUntilLoaded( page );
		await page.waitForTimeout( Number( options.settle ) );

		console.log( 'account:', account );
		console.log( 'url:', page.url() );
		console.log( 'title:', await page.title() );
		if ( stillLoading.length ) {
			console.log(
				`STILL LOADING after ${ LOADING_TIMEOUT / 1000 }s, so this report may be incomplete:\n  ` +
					stillLoading.join( '\n  ' )
			);
		}
		console.log( problems.length ? `problems:\n  ${ problems.join( '\n  ' ) }` : 'problems: none' );
		if ( options[ 'log-requests' ] ) {
			console.log(
				requests.length ? `requests:\n  ${ requests.join( '\n  ' ) }` : 'requests: none matched'
			);
		}

		if ( options.screenshot ) {
			await page.screenshot( { path: options.screenshot, fullPage: options[ 'full-page' ] } );
			console.log( 'screenshot:', options.screenshot );
		}

		if ( ! options[ 'no-snapshot' ] ) {
			const root = await mainContent( page );
			console.log( '\nARIA snapshot:\n' + ( await root.ariaSnapshot() ) );
		}
	} finally {
		await browser.close();
	}
}

main().catch( ( error ) => {
	console.error( error instanceof UserActionRequired ? error.message : error );
	process.exit( error instanceof UserActionRequired ? 2 : 1 );
} );
