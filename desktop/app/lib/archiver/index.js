const fs = require( 'fs' );
const path = require( 'path' );
const { Uint8ArrayReader, Uint8ArrayWriter, ZipWriter } = require( '@zip.js/zip.js' );
const log = require( '../../lib/logger' )( 'desktop:lib:archiver' );

module.exports = {
	/**
	 * Compresses `contents` to the archive at `dst`.
	 * @param {string[]} contents Paths to be zipped
	 * @param {string} dst Path to destination archive
	 * @param {function():void} onZipped Callback invoked when archive is complete
	 */
	zipContents: async ( contents, dst, onZipped ) => {
		const zip = new ZipWriter( new Uint8ArrayWriter() );
		const zipSubdir = path.basename( dst ).replace( '.zip', '' );

		// Zip entry names always use forward slashes, whatever the platform's separator.
		const add = async ( src, name ) => {
			const stat = fs.statSync( src );
			if ( stat.isDirectory() ) {
				for ( const entry of fs.readdirSync( src ) ) {
					await add( path.join( src, entry ), path.posix.join( name, entry ) );
				}
				return;
			}
			await zip.add( name, new Uint8ArrayReader( fs.readFileSync( src ) ), {
				lastModDate: stat.mtime,
			} );
		};

		for ( const src of contents ) {
			await add( src, path.posix.join( zipSubdir, path.basename( src ) ) );
		}

		const data = await zip.close();
		fs.writeFileSync( dst, data );
		log.debug( 'Archive finalized: %s bytes written', data.length );
		if ( typeof onZipped === 'function' ) {
			onZipped();
		}
	},
};
