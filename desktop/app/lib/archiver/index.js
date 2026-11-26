const fs = require( 'fs' );
const path = require( 'path' );
const { Uint8ArrayReader, Uint8ArrayWriter, ZipWriter } = require( '@zip.js/zip.js' );
const log = require( '../../lib/logger' )( 'desktop:lib:archiver' );

module.exports = {
	/**
	 * Compresses the files at `contents` to the archive at `dst`.
	 * @param {string[]} contents Paths of the files to be zipped
	 * @param {string} dst Path to destination archive
	 */
	zipContents: async ( contents, dst ) => {
		const zip = new ZipWriter( new Uint8ArrayWriter() );
		const zipSubdir = path.basename( dst ).replace( '.zip', '' );

		for ( const src of contents ) {
			// Zip entry names always use forward slashes, whatever the platform's separator.
			await zip.add(
				path.posix.join( zipSubdir, path.basename( src ) ),
				new Uint8ArrayReader( fs.readFileSync( src ) ),
				{ lastModDate: fs.statSync( src ).mtime }
			);
		}

		const data = await zip.close();
		fs.writeFileSync( dst, data );
		log.debug( 'Archive finalized: %s bytes written', data.length );
	},
};
