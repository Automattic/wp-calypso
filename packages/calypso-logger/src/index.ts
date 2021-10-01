/* eslint-disable no-console */

import log from 'loglevel';
import type { Logger, LogLevelDesc } from 'loglevel';

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

export const setup = ( logLevel: LogLevelDesc ): void => {
	log.methodFactory = function ( methodName ) {
		return nativeConsoleMethods[ methodName as keyof ConsoleImpl ] ?? nativeConsoleMethods.log;
	};
	log.setLevel( logLevel, false );

	window.console.trace = log.trace.bind( log );
	window.console.debug = log.debug.bind( log );
	window.console.log = log.log.bind( log );
	window.console.info = log.info.bind( log );
	window.console.warn = log.warn.bind( log );
	window.console.error = log.error.bind( log );
};

export const debugFactory2 = ( name: string ): ( ( ...msg: unknown[] ) => void ) => {
	const namedLogger = log.getLogger( name );
	namedLogger.methodFactory = function ( methodName, logLevel, loggerName ) {
		const rawMethod = log.methodFactory( methodName, logLevel, loggerName );
		return function ( msg ) {
			rawMethod( name + msg );
		};
	};
	namedLogger.setLevel( 'debug', false );
	return namedLogger.debug.bind( namedLogger );
};
