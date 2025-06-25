/**
 * External dependencies
 */
const { promisify } = require( 'util' );
const fs = require( 'fs' );
const path = require( 'path' );
const sass = require( 'sass' );
const postcss = require( 'postcss' );
const pkgDir = require( 'pkg-dir' );

/**
 * Path to packages directory.
 *
 * @type {string}
 */
const PACKAGES_DIR = path
	.resolve( __dirname, '../../packages' )
	.replace( /\\/g, '/' );

/**
 * Promisified fs.readFile.
 *
 * @type {Function}
 */
const readFile = promisify( fs.readFile );

/**
 * Promisified fs.writeFile.
 *
 * @type {Function}
 */
const writeFile = promisify( fs.writeFile );

/**
 * Promisified fs.writeFile.
 *
 * @type {Function}
 */
const makeDir = promisify( fs.mkdir );

/**
 * Promisified sass.render.
 *
 * @type {Function}
 */
const renderSass = promisify( sass.render );

/**
 * Get the package name for a specified file
 *
 * @param {string} file File name.
 *
 * @return {string} Package name.
 */
function getPackageName( file ) {
	return path.relative( PACKAGES_DIR, file ).split( path.sep )[ 0 ];
}

/**
 *
 * @param {string} pkgName
 * @returns {string}
 */
function findPackagePath( pkgName ) {
	const path = require.resolve( pkgName );
	return pkgDir.sync( path );
}

/**
 * Get Build Path for a specified file.
 *
 * @param {string} file        File to build.
 * @param {string} buildFolder Output folder.
 *
 * @return {string} Build path.
 */
function getBuildPath( file, buildFolder ) {
	const pkgName = getPackageName( file );
	const pkgSrcPath = path.resolve( PACKAGES_DIR, pkgName, 'src' );
	const pkgBuildPath = path.resolve( PACKAGES_DIR, pkgName, buildFolder );
	const relativeToSrcPath = path.relative( pkgSrcPath, file );
	return path.resolve( pkgBuildPath, relativeToSrcPath );
}

async function buildCSS( file ) {
	const outputFile = getBuildPath(
		file.replace( '.scss', '.css' ),
		'dist/style'
	);
	const outputFileRTL = getBuildPath(
		file.replace( '.scss', '-rtl.css' ),
		'dist/style'
	);

	const [ , contents ] = await Promise.all( [
		makeDir( path.dirname( outputFile ), { recursive: true } ),
		readFile( file, 'utf8' ),
	] );

	const importLists = [
		'colors',
		'breakpoints',
		'variables',
		'mixins',
		'animations',
		'z-index',
		'default-custom-properties',
	]
		.map( ( imported ) => `@import "${ imported }";` )
		.join( ' ' );

	const builtSass = await renderSass( {
		file,
		includePaths: [ findPackagePath( '@wordpress/base-styles' ) ],
		data: ''.concat( '@use "sass:math";', importLists, contents ),
	} );

	const result = await postcss( [
		require( 'postcss-local-keyframes' ),
		...require( '@wordpress/postcss-plugins-preset' ),
	] ).process( builtSass.css, {
		from: 'src/app.css',
		to: 'dest/app.css',
	} );

	const resultRTL = await postcss( [ require( 'rtlcss' )() ] ).process(
		result.css,
		{
			from: 'src/app.css',
			to: 'dest/app.css',
		}
	);

	await Promise.all( [
		writeFile( outputFile, result.css ),
		writeFile( outputFileRTL, resultRTL.css ),
	] );
}

buildCSS( 'src/style.scss' );
