/* eslint-disable no-console */

import log from 'loglevel';
import type { LogLevelDesc, Logger } from 'loglevel';

type ConsoleImpl = {
	trace: ( ...args: unknown[] ) => void;
	debug: ( ...args: unknown[] ) => void;
	log: ( ...args: unknown[] ) => void;
	info: ( ...args: unknown[] ) => void;
	warn: ( ...args: unknown[] ) => void;
	error: ( ...args: unknown[] ) => void;
};

const nativeConsoleMethods: ConsoleImpl = {
	trace: window.console.trace,
	debug: window.console.debug,
	log: window.console.log,
	info: window.console.info,
	warn: window.console.warn,
	error: window.console.error,
};

const interceptNativeConsole = ( log: Logger ): void => {
	window.console.trace = log.trace.bind( log );
	window.console.debug = log.debug.bind( log );
	window.console.log = log.log.bind( log );
	window.console.info = log.info.bind( log );
	window.console.warn = log.warn.bind( log );
	window.console.error = log.error.bind( log );
};

export const setup = ( logLevel: LogLevelDesc ): void => {
	// Set the default level. This is not persisted on page reload
	log.setDefaultLevel( logLevel );

	// Delegate log methods to `nativeConsoleMethods`. We need to use native methods
	// so they maintain the stack trace.
	log.methodFactory = ( methodName ) =>
		nativeConsoleMethods[ methodName as keyof ConsoleImpl ] ?? nativeConsoleMethods.log;

	// This call is used to apply methodFactory changes
	log.setLevel( log.getLevel() );

	// Overwrite console.* methods so they defer to log.*
	interceptNativeConsole( log );

	window.__setLoggerLevel = ( level: LogLevelDesc, persist = false ) => {
		// By default, don't persist the level.
		log.setLevel( level, persist );
		// loglevel works by setting some log methods to noop when we set a level, so we need to
		// re-attach them to window.console
		interceptNativeConsole( log );
	};
};

/**
 * Experimental debug-like API.
 *
 * Usage:
 *   const log = debugLoggerFactory("foo");
 *   log("bar") // will output 'foo bar' to the console
 */
export const debugLoggerFactory = ( name: string ): ( ( ...msg: unknown[] ) => void ) => {
	const namedLogger = log.getLogger( name );
	namedLogger.methodFactory = function ( methodName, logLevel, loggerName ) {
		const rawMethod = log.methodFactory( methodName, logLevel, loggerName );
		return function ( msg ) {
			rawMethod( name + ' ' + msg );
		};
	};
	namedLogger.setLevel( 'debug' );
	return namedLogger.debug.bind( namedLogger );
};
