/**
 * Credit: Modified from `winston-namespace` by @SetaSouto:
 * 	https://github.com/SetaSouto/winston-namespace
 *
 * Key changes:
 *
 * 1. Use a custom base configuration to avoid overriding the default configuration when
 * initializing each logger object. This maintains the same logger initialization API
 * as the prior logging solution (`debug` module).
 *
 * 2. Maintain prior log filtering behavior with the `DEBUG` environment variable
 * (instead of the `LOG_NAMESPACES` variable used in winston-namespace).
 */

/**
 * External dependencies
 */
const path = require( 'path' );
const { createLogger, format, transports } = require( 'winston' );

/**
 * Internal dependencies
 */
const state = require( 'app/lib/state' );
const namespaces = require( './namespaces' );

/**
 * Module variables
 */
const maxFiles = 3;
const maxsize = 15000000;

module.exports = ( namespace, options ) => {
	if ( ! options || typeof options !== 'object' ) options = {};

	const formatMessageWithMeta = ( info ) => {
		const args = info[ Symbol.for( 'splat' ) ];
		if ( args ) {
			if ( args instanceof Array && args.length && ! args[ 0 ] ) {
				return info;
			}
			info.message = info.message + JSON.stringify( ...args );
		}
		return info;
	};

	const baseformat = format.combine(
		format.timestamp( {
			format: 'YYYY-MM-DD HH:mm:ss.SSS',
		} ),
		format.errors( { stack: true } ),
		format( ( info, opts ) => formatMessageWithMeta( info, opts ) )(),
		format.printf( ( info ) => {
			const { timestamp, level, message } = info;
			const stack = info.stack ? `\n${ info.stack }` : '';
			return `[${ timestamp }] [${ namespace }] [${ level }] ${ message }` + stack;
		} )
	);

	const baseOptions = {
		level: process.env.LOG_LEVEL || 'silly',
		transports: [
			new transports.File( {
				dirname: path.dirname( state.getLogPath() ),
				filename: path.basename( state.getLogPath() ),
				maxFiles,
				maxsize,
				format: baseformat,
			} ),
		],
	};

	const enabled = namespaces.check( namespace );
	const logger = createLogger( { ...baseOptions, ...options } );
	if ( process.env.DEBUG ) {
		logger.add(
			new transports.Console( {
				format: baseformat,
			} )
		);
	}

	return {
		error: ( message, meta ) => logger.error( message, meta ),
		warn: ( message, meta ) => logger.warn( message, meta ),
		info: ( message, meta ) => logger.info( message, meta ),
		debug: ( message, meta ) => {
			if ( enabled ) logger.debug( message, meta );
		}, // eslint-disable-line brace-style
		silly: ( message, meta ) => {
			if ( enabled ) logger.silly( message, meta );
		}, // eslint-disable-line brace-style
	};
};
