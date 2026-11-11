#!/usr/bin/env node
/**
 * Opens a local or hosted Calypso page as a logged-in user and reports what it shows.
 *
 *   node browse.cjs <url> [options]
 *
 * <url> is absolute, or a path on the local dashboard (http://my.localhost:$PORT). An absolute
 * local URL without a port gets $PORT too. $PORT defaults to the checkout's dev server port.
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
		arrow: { type: 'string' },
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

/**
 * Points an absolute local URL at this checkout's dev server: `http://calypso.localhost/read`
 * gets its port, and another port is refused, since another checkout's server may be there.
 */
function withDevServerPort( target ) {
	if ( ! URL.canParse( target ) || ! isLocalTarget( target ) ) {
		return target;
	}
	const { port } = new URL( target );
	if ( ! port ) {
		return target.replace( /^(\w+:\/\/[^/?#]+)/, `$1:${ PORT }` );
	}
	if ( port !== String( PORT ) ) {
		throw new UserActionRequired(
			`${ target } is on port ${ port }, but this checkout's dev server uses port ${ PORT }. ` +
				`Leave the port out of the URL, or put PORT=${ port } in front of the command if that server runs this checkout.`
		);
	}
	return target;
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

async function findElement( page, selector ) {
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
	return element;
}

/**
 * Draws a red arrow pointing at the element from the first side with room for it, within
 * the page or, with `inViewport`, the visible part of it. Returns the bounds of the
 * arrow and element in page coordinates, so a cropped screenshot can include them.
 */
function drawArrow( node, inViewport ) {
	const LENGTH = 80;
	const rect = node.getBoundingClientRect();
	const box = {
		left: rect.left + window.scrollX - 4,
		top: rect.top + window.scrollY - 4,
		right: rect.right + window.scrollX + 4,
		bottom: rect.bottom + window.scrollY + 4,
	};
	const root = document.documentElement;
	const limits = inViewport
		? {
				left: window.scrollX,
				top: window.scrollY,
				right: window.scrollX + window.innerWidth,
				bottom: window.scrollY + window.innerHeight,
			}
		: { left: 0, top: 0, right: root.scrollWidth, bottom: root.scrollHeight };
	const midX = ( box.left + box.right ) / 2;
	const midY = ( box.top + box.bottom ) / 2;
	const reach = LENGTH + 16;
	const sides = [
		{ tip: [ box.left, midY ], dir: [ 1, 0 ], fits: box.left - reach >= limits.left },
		{ tip: [ box.right, midY ], dir: [ -1, 0 ], fits: box.right + reach <= limits.right },
		{ tip: [ midX, box.bottom ], dir: [ 0, -1 ], fits: box.bottom + reach <= limits.bottom },
		{ tip: [ midX, box.top ], dir: [ 0, 1 ], fits: box.top - reach >= limits.top },
	];
	const { tip, dir } = sides.find( ( side ) => side.fits ) ?? sides[ 0 ];
	const at = ( back, side = 0 ) => [
		tip[ 0 ] - dir[ 0 ] * back - dir[ 1 ] * side,
		tip[ 1 ] - dir[ 1 ] * back + dir[ 0 ] * side,
	];
	const [ tailX, tailY ] = at( LENGTH );
	const [ neckX, neckY ] = at( 20 );

	const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
	svg.id = 'verify-arrow';
	svg.setAttribute(
		'style',
		'position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;z-index:2147483647;' +
			'pointer-events:none;filter:drop-shadow(0 0 2px #fff) drop-shadow(0 0 1px #fff)'
	);
	svg.innerHTML = `<g stroke="#d63638" fill="#d63638" stroke-width="5" stroke-linejoin="round">
		<line x1="${ tailX }" y1="${ tailY }" x2="${ neckX }" y2="${ neckY }" stroke-linecap="round" />
		<polygon points="${ [ at( 0 ), at( 20, 12 ), at( 20, -12 ) ].join( ' ' ) }" />
	</g>`;
	root.appendChild( svg );

	return {
		left: Math.min( box.left, tailX - 16 ),
		top: Math.min( box.top, tailY - 16 ),
		right: Math.max( box.right, tailX + 16 ),
		bottom: Math.max( box.bottom, tailY + 16 ),
	};
}

/**
 * Saves a screenshot of the page, or with `selector`, of the first element matching it.
 * With `arrow`, points an arrow at the first element matching that selector.
 * Also available to --eval code as `screenshot( path, options )`.
 */
async function takeScreenshot( page, file, { selector, fullPage = false, arrow } = {} ) {
	const target = screenshotTarget( file );
	fs.mkdirSync( path.dirname( target ), { recursive: true } );
	const settings = {
		path: target,
		animations: 'disabled',
		caret: 'hide',
		// The dev server's environment badge isn't on production.
		style: '.environment-badge { display: none !important; }',
	};
	let drawing;
	if ( arrow ) {
		const marked = await findElement( page, arrow );
		await marked.scrollIntoViewIfNeeded();
		drawing = await marked.evaluate( drawArrow, ! selector && ! fullPage );
	}
	try {
		if ( selector ) {
			const element = await findElement( page, selector );
			// Crop a full-page capture rather than scrolling to the element, so fixed
			// headers stay at the top of the page instead of covering it.
			const box = await element.evaluate( ( node ) => {
				const { left, top, right, bottom } = node.getBoundingClientRect();
				return {
					left: left + window.scrollX,
					top: top + window.scrollY,
					right: right + window.scrollX,
					bottom: bottom + window.scrollY,
				};
			} );
			if ( drawing ) {
				box.left = Math.max( 0, Math.min( box.left, drawing.left ) );
				box.top = Math.max( 0, Math.min( box.top, drawing.top ) );
				box.right = Math.max( box.right, drawing.right );
				box.bottom = Math.max( box.bottom, drawing.bottom );
			}
			const clip = {
				x: box.left,
				y: box.top,
				width: box.right - box.left,
				height: box.bottom - box.top,
			};
			await page.screenshot( { ...settings, fullPage: true, clip } );
		} else {
			await page.screenshot( { ...settings, fullPage } );
		}
	} finally {
		if ( drawing ) {
			await page.evaluate( () => document.getElementById( 'verify-arrow' )?.remove() );
		}
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
			if ( ! isCalypsoLiveTarget( page.url() ) || ! commit ) {
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
				arrow: options.arrow,
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
	if ( ! positionals[ 0 ] ) {
		throw new UserActionRequired( 'Usage: node browse.cjs <url> [options]' );
	}
	const target = withDevServerPort( positionals[ 0 ] );
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
