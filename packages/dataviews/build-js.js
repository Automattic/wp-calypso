/**
 * External dependencies
 */
const { promisify } = require( 'util' );
const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );
const babel = require( '@babel/core' );

/**
 * Internal dependencies
 */
const getBabelConfig = require( './get-babel-config' );

/**
 * Path to packages directory.
 *
 * @type {string}
 */
const PACKAGES_DIR = path
	.resolve( __dirname, '../../packages' )
	.replace( /\\/g, '/' );

/**
 * Mapping of JavaScript environments to corresponding build output.
 *
 * @type {Object}
 */
const JS_ENVIRONMENTS = {
	main: 'build',
	module: 'build-module',
};

/**
 * Promisified fs.writeFile.
 *
 * @type {Function}
 */
const writeFile = promisify( fs.writeFile );

/**
 * Promisified fs.mkdir
 *
 * @type {Function}
 */
const makeDir = promisify( fs.mkdir );

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

async function buildJS( file ) {
	for ( const [ environment, buildDir ] of Object.entries(
		JS_ENVIRONMENTS
	) ) {
		const destPath = getBuildPath(
			file.replace( /\.tsx?$/, '.js' ),
			buildDir
		);
		const babelOptions = getBabelConfig(
			environment,
			file.replace( PACKAGES_DIR, '@wordpress' )
		);

		const [ , transformed ] = await Promise.all( [
			makeDir( path.dirname( destPath ), { recursive: true } ),
			babel.transformFileAsync( file, babelOptions ),
		] );

		await Promise.all( [
			writeFile( destPath + '.map', JSON.stringify( transformed.map ) ),
			writeFile(
				destPath,
				transformed.code +
					'\n//# sourceMappingURL=' +
					path.basename( destPath ) +
					'.map'
			),
		] );
	}
}

const srcFiles = glob.sync(
	`${ PACKAGES_DIR }/dataviews/src/**/*.{js,ts,tsx}`,
	{ ignore: [ '**/{stories}/**' ], onlyFiles: true }
);
srcFiles.forEach( ( file ) => {
	buildJS( file );
} );
