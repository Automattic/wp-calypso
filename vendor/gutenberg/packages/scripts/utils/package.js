/**
 * External dependencies
 */
const { realpathSync } = require( 'fs' );
const { sync: readPkgUp } = require( 'read-pkg-up' );

/**
 * Internal dependencies
 */
const { getCurrentWorkingDirectory } = require( './process' );

const { pkg, path: pkgPath } = readPkgUp( {
	cwd: realpathSync( getCurrentWorkingDirectory() ),
} );

const getPackagePath = () => pkgPath;

const hasPackageProp = ( prop ) => pkg && pkg.hasOwnProperty( prop );

module.exports = {
	getPackagePath,
	hasPackageProp,
};
