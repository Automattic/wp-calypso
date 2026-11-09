#!/usr/bin/env node
/**
 * Opens a local or hosted Calypso page as a logged-in user and reports what it shows.
 *
 *   node browse.cjs <url> [options]
 *
 * <url> is absolute, or a path on the local dashboard (http://my.localhost:$PORT).
 * The options are documented in ../browser.md.
 */
const fs = require( 'node:fs' );
const path = require( 'node:path' );
const { setTimeout: delay } = require( 'node:timers/promises' );
const { parseArgs } = require( 'node:util' );
const {
	AUTH_COMMAND,
	OWN_ACCOUNT,
	PORT,
	REPO_ROOT,
	UserActionRequired,
	isLoginUrl,
	launchBrowser,
	logInTestAccount,
	statePath,
	testAccountSite,
} = require( './lib.cjs' );

const { values: options, positionals } = parseArgs( {
	allowPositionals: true,
	options: {
		as: { type: 'string', default: 'defaultUser' },
		'wait-for': { type: 'string' },
		eval: { type: 'string' },
		'eval-file': { type: 'string' },
		screenshot: { type: 'string' },
		clip: { type: 'string' },
		'full-page': { type: 'boolean', default: false },
		'no-snapshot': { type: 'boolean', default: false },
		viewport: { type: 'string', default: '1440x1000' },
		settle: { type: 'string', default: '2000' },
		'log-requests': { type: 'string' },
	},
} );

const AsyncFunction = async function () {}.constructor;

// A mistake in the options, reported without a stack trace.
class UsageError extends Error {}

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
// A spinner may only mount once the first render has fired its queries, which after a
// click in the dashboard can take over a second.
const LOADING_QUIET_PERIOD = 2000;

const BUILD_TIMEOUT = 90000;
const LOCAL_DASHBOARD_ORIGIN = `http://my.localhost:${ PORT }`;

function isLocalTarget( url ) {
	const { hostname } = new URL( url, LOCAL_DASHBOARD_ORIGIN );
	return (
		hostname === 'localhost' ||
		hostname.endsWith( '.localhost' ) ||
		hostname === '127.0.0.1' ||
		hostname === '[::1]'
	);
}

function isCalypsoLiveTarget( url ) {
	const { hostname } = new URL( url );
	return hostname === 'calypso.live' || hostname.endsWith( '.calypso.live' );
}

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
		await delay( 5000 );
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
		// Report-only CSP violations block nothing; the site preview logs them on Atomic sites.
		if ( message.type() === 'error' && ! /report-only/i.test( message.text() ) ) {
			problems.push( `console: ${ clip( message.text() ) }` );
		}
	} );
	page.on( 'pageerror', ( error ) => problems.push( `pageerror: ${ clip( error.message ) }` ) );
	page.on( 'response', async ( response ) => {
		const url = response.url();
		const logged = logPattern?.test( url );
		if ( ! logged && ! /localhost|wordpress\.com|calypso\.live/.test( url ) ) {
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

async function navigate( page, url, problems, requests ) {
	// Hosted pages can render while third-party resources are still loading.
	const waitUntil = isLocalTarget( url ) ? 'load' : 'domcontentloaded';
	if ( ! isCalypsoLiveTarget( url ) ) {
		await page.goto( url, { waitUntil, timeout: 60000 } );
		return;
	}

	const deadline = Date.now() + BUILD_TIMEOUT;
	let status;
	do {
		problems.length = 0;
		requests.length = 0;
		// Retry the original link so the launcher can resolve the current container.
		const response = await page.goto( url, {
			waitUntil,
			timeout: Math.max( 1, deadline - Date.now() ),
		} );
		status = response?.status();
		if ( status >= 200 && status < 300 && status !== 202 ) {
			return;
		}
		if ( status !== 202 && ! ( status >= 500 && status <= 599 ) ) {
			break;
		}
		await delay( Math.min( 3000, Math.max( 0, deadline - Date.now() ) ) );
	} while ( Date.now() < deadline );

	throw new Error( `Calypso Live did not load: ${ status ? `HTTP ${ status }` : 'no response' }.` );
}

async function open( browser, account, url ) {
	const [ width, height ] = options.viewport.split( 'x' ).map( Number );
	const context = await browser.newContext( {
		storageState: statePath( account ),
		viewport: { width, height },
		reducedMotion: 'reduce',
	} );
	const page = await context.newPage();
	const { problems, requests } = watch( page );
	await navigate( page, url, problems, requests );
	// The dashboard checks the session client-side, so a rejected one redirects after load.
	await Promise.race( [
		page.waitForURL( ( current ) => isLoginUrl( current.toString() ), { timeout: 30000 } ),
		page.getByRole( 'heading', { level: 1 } ).first().waitFor( { timeout: 30000 } ),
	] ).catch( () => {} );
	return { context, page, problems, requests };
}

/**
 * Resolves a screenshot path, refusing one inside the repository so images never get committed.
 */
function screenshotTarget( file ) {
	const target = path.resolve( file );
	if ( ! path.relative( REPO_ROOT, target ).startsWith( '..' ) ) {
		throw new Error(
			`Save screenshots outside the repository, not in ${ target }: images must never be committed.`
		);
	}
	return target;
}

/**
 * Saves a screenshot of the page, or with `selector`, of the first element matching it.
 * Also available to --eval code as `screenshot( path, options )`.
 */
async function takeScreenshot( page, file, { selector, fullPage = false } = {} ) {
	const target = screenshotTarget( file );
	fs.mkdirSync( path.dirname( target ), { recursive: true } );
	const settings = {
		path: target,
		animations: 'disabled',
		caret: 'hide',
		// The dev server's environment badge isn't on production.
		style: '.environment-badge { display: none !important; }',
	};
	if ( selector ) {
		const element = page.locator( selector ).first();
		const found = await element
			.waitFor( { state: 'attached', timeout: 5000 } )
			.then( () => true )
			.catch( () => false );
		if ( ! found ) {
			throw new UsageError(
				`No element on ${ page.url() } matches ${ JSON.stringify( selector ) }. ` +
					`Check with --eval 'return page.locator( ${ JSON.stringify( selector ) } ).count();'`
			);
		}
		// Crop a full-page capture rather than scrolling to the element, so fixed
		// headers stay at the top of the page instead of covering it.
		const box = await element.evaluate( ( node ) => {
			const { x, y, width, height } = node.getBoundingClientRect();
			return { x: x + window.scrollX, y: y + window.scrollY, width, height };
		} );
		await page.screenshot( { ...settings, fullPage: true, clip: box } );
	} else {
		await page.screenshot( { ...settings, fullPage } );
	}
	console.log( 'screenshot:', target );
}

const accounts = options.as.split( ',' );

// With several accounts, `after.png` becomes `after-atomicUser.png`.
function screenshotPathFor( file, account ) {
	if ( accounts.length === 1 ) {
		return file;
	}
	const { dir, name, ext } = path.parse( file );
	return path.join( dir, `${ name }-${ account }${ ext }` );
}

async function check( browser, account, target ) {
	const resolved = target.includes( '{site}' )
		? target.replaceAll( '{site}', testAccountSite( account ) )
		: target;
	const url = new URL( resolved, LOCAL_DASHBOARD_ORIGIN ).toString();
	await ensureState( account );

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
			throw new Error( `Still redirected to the login page after logging in ${ account } again.` );
		}
	}

	try {
		if ( isCalypsoLiveTarget( url ) && ! isLoginUrl( page.url() ) ) {
			const commit = await page.evaluate( () => window.COMMIT_SHA );
			if ( ! commit ) {
				throw new Error( `Calypso Live did not load a build at ${ page.url() }.` );
			}
			console.log( 'preview commit:', commit );
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
			const screenshot = ( file, settings ) =>
				takeScreenshot( page, screenshotPathFor( file, account ), settings );
			const loaded = async () => {
				const left = await waitUntilLoaded( page );
				if ( left.length ) {
					throw new Error(
						`Still loading after ${ LOADING_TIMEOUT / 1000 }s: ${ left.join( ', ' ) }`
					);
				}
			};
			const result = await new AsyncFunction( 'page', 'context', 'screenshot', 'loaded', code )(
				page,
				context,
				screenshot,
				loaded
			);
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
			await takeScreenshot( page, screenshotPathFor( options.screenshot, account ), {
				selector: options.clip,
				fullPage: options[ 'full-page' ],
			} );
		}

		if ( ! options[ 'no-snapshot' ] ) {
			const root = await mainContent( page );
			console.log( '\nARIA snapshot:\n' + ( await root.ariaSnapshot() ) );
		}
	} finally {
		await context.close();
	}
}

async function main() {
	const [ target ] = positionals;
	if ( ! target ) {
		throw new UserActionRequired( 'Usage: node browse.cjs <url> [options]' );
	}
	if ( options.screenshot ) {
		screenshotTarget( options.screenshot );
	}

	if ( isLocalTarget( target ) ) {
		await waitForDevServer();
		console.log( `dev server: up on port ${ PORT }` );
	}

	const browser = await launchBrowser();
	try {
		for ( const account of accounts ) {
			if ( accounts.length > 1 ) {
				console.log( `\n===== ${ account } =====` );
			}
			await check( browser, account, target );
		}
	} finally {
		await browser.close();
	}
}

main().catch( ( error ) => {
	console.error(
		error instanceof UserActionRequired || error instanceof UsageError ? error.message : error
	);
	process.exit( error instanceof UserActionRequired ? 2 : 1 );
} );
