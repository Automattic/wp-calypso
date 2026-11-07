// HMR on a server-linked sheet: edit it with /themes open; does the link swap, without a reload or a duplicate?
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';
const PORT = '3010';
const SHEET = 'client/my-sites/themes/collections/style.scss';
const original = fs.readFileSync( SHEET, 'utf8' );
const child = spawn( 'node', [ 'build/server-vite-dev.cjs' ], { detached: true, stdio: 'ignore', env: { ...process.env, CALYPSO_ENV: 'development', NODE_ENV: 'development', CALYPSO_BUNDLER: 'vite', CALYPSO_VITE_ALL: '1', PORT, CALYPSO_VITE_SECTION_CSS: process.argv[ 2 ] ?? 'walk' } } );
const cleanup = () => { fs.writeFileSync( SHEET, original ); try { process.kill( -child.pid ); } catch {} };
process.on( 'exit', cleanup );
for ( ;; ) { try { await fetch( `http://calypso.localhost:${ PORT }/browsehappy` ); break; } catch { await new Promise( ( r ) => setTimeout( r, 100 ) ); } }
const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on( 'console', ( m ) => /vite/.test( m.text() ) && logs.push( m.text() ) );
await page.goto( `http://calypso.localhost:${ PORT }/themes`, { waitUntil: 'load' } );
await page.waitForTimeout( 6000 );
const state = () => page.evaluate( ( sheet ) => ( {
	marker: window.__marker,
	links: [ ...document.querySelectorAll( 'link[rel=stylesheet]' ) ].filter( ( l ) => l.href.includes( sheet ) ).map( ( l ) => l.getAttribute( 'href' ) ),
	styles: [ ...document.querySelectorAll( 'style[data-vite-dev-id]' ) ].filter( ( s ) => s.dataset.viteDevId.includes( sheet ) ).length,
	outline: getComputedStyle( document.body ).outlineColor + ' ' + getComputedStyle( document.body ).outlineStyle,
} ), SHEET );
await page.evaluate( () => ( window.__marker = 'no-reload' ) );
console.log( 'before', await state() );
fs.writeFileSync( SHEET, original + '\nbody { outline: 3px solid rgb(255, 0, 0); }\n' );
await page.waitForTimeout( 3000 );
console.log( 'after edit', await state() );
fs.writeFileSync( SHEET, original );
await page.waitForTimeout( 3000 );
console.log( 'after revert', await state() );
console.log( logs.filter( ( l ) => /hot|reload|update/.test( l ) ).slice( -6 ) );
await browser.close();
cleanup();
process.exit( 0 );
