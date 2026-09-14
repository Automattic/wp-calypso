#!/usr/bin/env node

/**
 * Compile `src/style.scss` to `dist/{esm,cjs}/style.css` and rewrite the
 * emitted JS imports from `./style.scss` to `./style.css`. The source
 * keeps the `.scss` import so Calypso consumers using `calypso:src`
 * continue to bundle the SCSS through their own sass-loader.
 */

const fs = require( 'fs' );
const path = require( 'path' );
const sass = require( 'sass' );

const PKG = path.resolve( __dirname, '..' );
const baseStyles = path.dirname( require.resolve( '@wordpress/base-styles/package.json' ) );
const nodeModulesRoot = path.resolve( baseStyles, '..', '..' );

const css = sass.compile( path.join( PKG, 'src', 'style.scss' ), {
	loadPaths: [ nodeModulesRoot ],
	style: 'expanded',
} ).css;

for ( const subdir of [ 'dist/esm', 'dist/cjs' ] ) {
	const dir = path.join( PKG, subdir );
	fs.writeFileSync( path.join( dir, 'style.css' ), css );
	for ( const file of fs.readdirSync( dir ) ) {
		if ( ! file.endsWith( '.js' ) ) {
			continue;
		}
		const full = path.join( dir, file );
		const content = fs.readFileSync( full, 'utf8' );
		if ( content.includes( './style.scss' ) ) {
			fs.writeFileSync( full, content.replaceAll( './style.scss', './style.css' ) );
		}
	}
}
