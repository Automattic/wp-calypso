/**
 * External dependencies
 */
const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules
const path = require( 'path' );
const archiver = require( 'archiver' );

/**
 * Internal dependencies
 */
const log = require( '../../lib/logger' )( 'desktop:lib:archiver' );

module.exports = {
	/**
	 * Compresses `contents` to the archive at `dst`.
	 *
	 * @param {string[]} contents Paths to be zipped
	 * @param {string} dst Path to destination archive
	 * @param {function():void} onZipped Callback invoked when archive is complete
	 */
	zipContents: ( contents, dst, onZipped ) => {
		const output = fs.createWriteStream( dst );
		const archive = archiver( 'zip', {
			zlib: { level: 9 },
		} );

		output.on( 'close', function () {
			log.debug( 'Archive finalized: %s bytes written', archive.pointer() );
			if ( typeof onZipped === 'function' ) {
				onZipped();
			}
		} );

		// Catch warnings (e.g. stat failures and other non-blocking errors)
		archive.on( 'warning', function ( err ) {
			log.warn( 'Unexpected error: ', err );
		} );

		archive.on( 'error', function ( err ) {
			throw err;
		} );

		archive.pipe( output );

		for ( let i = 0; i < contents.length; i++ ) {
			const src = contents[ i ];
			const zipSubdir = path.basename( dst ).replace( '.zip', '' );
			const dstInZipSubdir = path.join( zipSubdir, path.basename( src ) );

			const stat = fs.lstatSync( src );
			if ( stat.isDirectory() ) {
				archive.directory( path.join( src, path.sep ), dstInZipSubdir );
				continue;
			}
			archive.file( src, { name: dstInZipSubdir } );
		}

		archive.finalize();
	},
};
