// Launch start:vite with a section-CSS mode, load routes cold then warm, record CSS/FOUC/image facts.
//   node tmp/dotmsd-1682/measure.mjs <mode> [routes,comma,separated] [ENV=val ...]
import { spawn, execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [ mode = 'walk', routesArg, ...rest ] = process.argv.slice( 2 );
const extraEnv = Object.fromEntries( rest.map( ( kv ) => kv.split( '=' ) ) );
const routes = ( routesArg ?? '/themes,/plugins,/log-in,/discover,/patterns,/theme/twentytwentyfive,/setup' ).split( ',' );
const PORT = extraEnv.PORT ?? '3010';
const out = path.join( process.cwd(), 'tmp/section-css-out', mode );
fs.mkdirSync( out, { recursive: true } );
const logFile = path.join( out, 'server.log' );
const fd = fs.openSync( logFile, 'w' );
const t0 = Date.now();
const child = spawn( 'node', [ 'build/server-vite-dev.cjs' ], {
	detached: true,
	env: {
		...process.env,
		CALYPSO_ENV: 'development',
		NODE_ENV: 'development',
		CALYPSO_BUNDLER: 'vite',
		CALYPSO_VITE_ALL: '1',
		CALYPSO_VITE_SECTION_CSS: mode,
		PORT,
		...extraEnv,
	},
	stdio: [ 'ignore', fd, fd ],
} );
let peakRss = 0;
const rssTimer = setInterval( () => {
	try {
		peakRss = Math.max( peakRss, Number( execSync( `ps -o rss= -p ${ child.pid }` ).toString().trim() ) / 1024 );
	} catch {}
}, 250 );
const kill = () => {
	try {
		process.kill( -child.pid );
	} catch {}
};
process.on( 'exit', kill );
for ( ;; ) {
	try {
		await fetch( `http://calypso.localhost:${ PORT }/browsehappy` );
		break;
	} catch {
		await new Promise( ( r ) => setTimeout( r, 50 ) );
	}
}
const listening = Date.now() - t0;
if ( extraEnv.WAIT_STARTUP ) {
	while ( ! /start-up CSS crawl/.test( fs.readFileSync( logFile, 'utf8' ) ) ) {
		await new Promise( ( r ) => setTimeout( r, 200 ) );
	}
}

const INIT = () => {
	window.__injected = [];
	new MutationObserver( ( ms ) => {
		for ( const m of ms ) {
			for ( const n of m.addedNodes ) {
				if ( n.nodeName === 'STYLE' && n.dataset?.viteDevId ) {
					window.__injected.push( performance.now() );
				}
			}
		}
	} ).observe( document, { childList: true, subtree: true } );
};

const browser = await chromium.launch();
async function visit( route, label ) {
	const ctx = await browser.newContext( { viewport: { width: 1280, height: 900 } } );
	await ctx.addInitScript( INIT );
	const page = await ctx.newPage();
	let reqs = 0;
	const notFound = [];
	const errors = [];
	page.on( 'request', () => reqs++ );
	page.on( 'response', ( r ) => r.status() === 404 && notFound.push( new URL( r.url() ).pathname ) );
	page.on( 'pageerror', ( e ) => errors.push( String( e ).slice( 0, 160 ) ) );
	page.on( 'console', ( m ) => /hydrat|did not match|didn't match/i.test( m.text() ) && ! /Skipping initial state rehydration/.test( m.text() ) && errors.push( m.text().slice( 0, 200 ) ) );
	const start = Date.now();
	await page.goto( `http://calypso.localhost:${ PORT }${ route }`, { waitUntil: 'load', timeout: 300000 } );
	await page.waitForLoadState( 'networkidle', { timeout: 20000 } ).catch( () => {} );
	const wall = Date.now() - start;
	const facts = await page.evaluate( () => {
		const nav = performance.getEntriesByType( 'navigation' )[ 0 ];
		const fcp = performance.getEntriesByName( 'first-contentful-paint' )[ 0 ]?.startTime ?? -1;
		const linkIds = new Set( [ ...document.querySelectorAll( 'link[rel=stylesheet][data-vite-dev-id]' ) ].map( ( l ) => l.dataset.viteDevId ) );
		const styles = [ ...document.querySelectorAll( 'style[data-vite-dev-id]' ) ];
		const fp = [];
		for ( const el of document.querySelectorAll( 'body *' ) ) {
			const cs = getComputedStyle( el );
			fp.push( [ cs.display, cs.position, cs.color, cs.backgroundColor, cs.fontSize, cs.fontWeight, cs.margin, cs.padding, cs.fontFamily, cs.lineHeight, cs.borderTop ].join( '|' ) );
		}
		return {
			ttfb: Math.round( nav.responseStart ),
			fcp: Math.round( fcp ),
			dcl: Math.round( nav.domContentLoadedEventEnd ),
			load: Math.round( nav.loadEventEnd ),
			linked: document.querySelectorAll( 'link[rel=stylesheet]' ).length,
			linkedWithId: linkIds.size,
			injected: styles.length,
			duplicates: styles.filter( ( s ) => linkIds.has( s.dataset.viteDevId ) ).length,
			injectedAfterFcp: window.__injected.filter( ( t ) => t > fcp ).length,
			lastInjected: Math.round( Math.max( 0, ...window.__injected ) ),
			elements: fp.length,
			fp: fp.join( '\n' ),
			order: [ ...document.querySelectorAll( 'link[rel=stylesheet], style[data-vite-dev-id]' ) ]
				.map( ( el ) => ( el.dataset.viteDevId ?? el.getAttribute( 'href' ) ).replace( location.origin, '' ) )
				.join( '\n' ),
		};
	} );
	const fingerprint = crypto.createHash( 'sha1' ).update( facts.fp ).digest( 'hex' ).slice( 0, 10 );
	fs.writeFileSync( path.join( out, `${ route.replace( /\W+/g, '_' ) }-${ label }.fp.txt` ), facts.fp );
	delete facts.fp;
	fs.writeFileSync( path.join( out, `${ route.replace( /\W+/g, '_' ) }-${ label }.order.txt` ), facts.order );
	delete facts.order;
	await ctx.close();
	// What first paint shows: server markup + linked CSS, no JS.
	let noJsShot;
	if ( label === 'warm' ) {
		const nojs = await browser.newContext( { javaScriptEnabled: false, viewport: { width: 1280, height: 900 } } );
		const p = await nojs.newPage();
		await p.goto( `http://calypso.localhost:${ PORT }${ route }`, { waitUntil: 'load', timeout: 120000 } );
		noJsShot = path.join( out, `${ route.replace( /\W+/g, '_' ) }-nojs.png` );
		await p.screenshot( { path: noJsShot } );
		await nojs.close();
	}
	return { route, label, wall, reqs, ...facts, fingerprint, notFound: notFound.filter( ( u ) => ! /_static|mu-plugins|wp-content/.test( u ) ), errors };
}

const results = [];
for ( const route of routes ) {
	results.push( await visit( route, 'cold' ) );
	results.push( await visit( route, 'warm' ) );
}
await browser.close();
clearInterval( rssTimer );
const serverLog = fs.readFileSync( logFile, 'utf8' ).split( '\n' ).filter( ( l ) => /\[prototype\]/.test( l ) );
const summary = { mode, listening, peakRssMb: Math.round( peakRss ), results, serverLog };
fs.writeFileSync( path.join( out, 'result.json' ), JSON.stringify( summary, null, 1 ) );
for ( const r of results ) {
	console.log(
		`${ mode } ${ r.route } ${ r.label }: ttfb ${ r.ttfb } fcp ${ r.fcp } dcl ${ r.dcl } idle ${ r.wall } | links ${ r.linked } (ids ${ r.linkedWithId }) injected ${ r.injected } dup ${ r.duplicates } afterFcp ${ r.injectedAfterFcp } | fp ${ r.fingerprint } (${ r.elements }) | 404 ${ r.notFound.length } ${ r.notFound.slice( 0, 3 ).join( ' ' ) } | err ${ r.errors.length } ${ r.errors.slice( 0, 2 ).join( ' / ' ) }`
	);
}
console.log( `listening ${ listening }ms, peak RSS ${ Math.round( peakRss ) }MB` );
serverLog.forEach( ( l ) => console.log( '  ' + l ) );
kill();
process.exit( 0 );
