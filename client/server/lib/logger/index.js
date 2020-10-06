/* eslint jsdoc/no-undefined-types:["error", {definedTypes: ["stream"]}] */

/**
 * External dependencies
 */
import bunyan from 'bunyan';
import fs from 'fs';
import { Transform } from 'stream';
import { EOL } from 'os';

/**
 * Creates a stream that filters out some fields.
 *
 * This is required because `bunyan` does not implement an option to disable core fields.
 * We want to disable `hostname` because our logging system already adds `host` with the same
 * info.
 *
 * @param {string[]} fields List of fields to filter out
 * @param {stream.Writable} destination Stream to write the filtered fields to
 */
const filteredStream = ( fields, destination ) => {
	const transformStream = new Transform( {
		// Set object mode to receive unserialized JSON objects
		objectMode: true,
		transform( data, encoding, callback ) {
			// Make a copy of `data`, excluding any field in `fields`
			const filteredData = Object.entries( data )
				.filter( ( [ key ] ) => ! fields.includes( key ) )
				.reduce( ( record, [ key, value ] ) => {
					record[ key ] = value;
					return record;
				}, {} );

			if ( destination.writableObjectMode ) {
				callback( null, transformStream );
			} else {
				try {
					callback( null, JSON.stringify( filteredData ) + EOL );
				} catch ( err ) {
					callback( err );
				}
			}
		},
	} );
	transformStream.pipe( destination );
	return transformStream;
};

let logger;

const createLogger = () => {
	logger = bunyan.createLogger( {
		name: 'calypso',
		streams: [
			{
				type: 'raw',
				level: 'info',
				stream: filteredStream( [ 'hostname' ], process.stdout ),
			},
		],
	} );
	if ( process.env.CALYPSO_LOGFILE ) {
		logger.addStream( {
			type: 'raw',
			level: 'info',
			stream: filteredStream(
				[ 'hostname' ],
				fs.createWriteStream( process.env.CALYPSO_LOGFILE, { flags: 'a', encoding: 'utf8' } )
			),
		} );
	}
};

export const getLogger = () => {
	if ( ! logger ) createLogger();
	return logger;
};
