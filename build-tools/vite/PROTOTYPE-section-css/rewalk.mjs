// Cost of re-walking closures after a JS edit (closure cache cleared, transforms mostly cached).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';
const PORT = '3010';
const FILE = 'client/my-sites/themes/theme-showcase.jsx';
const original = fs.readFileSync( FILE, 'utf8' );
fs.mkdirSync( 'tmp/section-css-out', { recursive: true } );
const log = fs.openSync( 'tmp/section-css-out/rewalk.log', 'w' );
const child = spawn( 'node', [ 'build/server-vite-dev.cjs' ], { detached: true, stdio: [ 'ignore', log, log ], env: { ...process.env, CALYPSO_ENV: 'development', NODE_ENV: 'development', CALYPSO_BUNDLER: 'vite', CALYPSO_VITE_ALL: '1', PORT } } );
const cleanup = () => { fs.writeFileSync( FILE, original ); try { process.kill( -child.pid ); } catch {} };
process.on( 'exit', cleanup );
for ( ;; ) { try { await fetch( `http://calypso.localhost:${ PORT }/browsehappy` ); break; } catch { await new Promise( ( r ) => setTimeout( r, 100 ) ); } }
const browser = await chromium.launch();
const page = await browser.newPage();
const url = `http://calypso.localhost:${ PORT }/themes`;
await page.goto( url, { waitUntil: 'load' } );
await page.waitForTimeout( 4000 );
for ( let i = 0; i < 3; i++ ) {
	fs.writeFileSync( FILE, original + `\n// rewalk ${ i }\n` );
	await page.waitForTimeout( 1500 );
	const t = Date.now();
	const r = await fetch( url );
	await r.text();
	console.log( `after edit ${ i }: SSR response ${ Date.now() - t }ms` );
}
const t = Date.now();
await ( await fetch( url ) ).text();
console.log( `no edit: SSR response ${ Date.now() - t }ms` );
await browser.close();
cleanup();
console.log( fs.readFileSync( 'tmp/section-css-out/rewalk.log', 'utf8' ).split( '\n' ).filter( ( l ) => /section css/.test( l ) ).join( '\n' ) );
process.exit( 0 );
