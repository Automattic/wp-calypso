#!/usr/bin/env node
/**
 * Writes <dir>/preview.html, a throwaway page showing the before-*.png and after-*.png
 * screenshots in <dir> as the table they'll get in the PR description.
 *
 *   node preview.cjs <dir>
 */
const fs = require( 'node:fs' );
const path = require( 'node:path' );

const dir = path.resolve( process.argv[ 2 ] ?? '.' );
const files = fs.readdirSync( dir );
const slugs = [
	...new Set( files.map( ( file ) => file.match( /^(?:before|after)-(.+)\.png$/ )?.[ 1 ] ) ),
]
	.filter( Boolean )
	.sort();
if ( ! slugs.length ) {
	console.error( `No before-*.png or after-*.png in ${ dir }.` );
	process.exit( 1 );
}

const hasBefore = files.some( ( file ) => file.startsWith( 'before-' ) );
const named = slugs.length > 1;
const cell = ( file ) => `<td>${ files.includes( file ) ? `<img src="${ file }">` : '' }</td>`;
const row = ( slug ) =>
	`<tr>${ named ? `<th>${ slug.replaceAll( '-', ' ' ) }</th>` : '' }` +
	`${ hasBefore ? cell( `before-${ slug }.png` ) : '' }${ cell( `after-${ slug }.png` ) }</tr>`;

const target = path.join( dir, 'preview.html' );
fs.writeFileSync(
	target,
	`<!doctype html>
<meta charset="utf-8">
<title>Screenshot preview</title>
<style>
	body { font: 14px sans-serif; margin: 24px; }
	table { border-collapse: collapse; width: 100%; table-layout: fixed; }
	th, td { border: 1px solid #d1d9e0; padding: 6px; vertical-align: top; }
	img { max-width: 100%; }
</style>
<table>
<tr>${ named ? '<th></th>' : '' }${ hasBefore ? '<th>Before</th>' : '' }<th>After</th></tr>
${ slugs.map( row ).join( '\n' ) }
</table>
`
);
console.log( 'preview:', target );
